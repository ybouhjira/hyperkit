use clap::{Parser, Subcommand};
use colored::Colorize;
use comfy_table::{modifiers::UTF8_ROUND_CORNERS, presets::UTF8_FULL, Attribute, Cell, Color, Table};
use indicatif::{ProgressBar, ProgressStyle};
use std::{
    fs,
    path::{Path, PathBuf},
    time::Duration,
};
use walkdir::WalkDir;

// ── CLI ────────────────────────────────────────────────────────────────────────

#[derive(Parser)]
#[command(
    name = "sk-audit",
    about = "AI Discoverability Scoring Tool for SolidKit projects",
    version = "0.1.0",
    long_about = "Audits a project's AI discoverability and outputs a scored report.\n\
                  Pass threshold: 80%. Checks AGENTS.md, .cursorrules, llms.txt, JSDoc, and more."
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run AI discoverability audit on a project path
    Check {
        /// Path to the project root
        path: PathBuf,
    },
}

// ── Score result types ─────────────────────────────────────────────────────────

#[derive(Debug)]
struct CheckResult {
    name: &'static str,
    description: &'static str,
    score: u32,
    max_score: u32,
    status: CheckStatus,
    details: Vec<String>,
}

#[derive(Debug, Clone, PartialEq)]
enum CheckStatus {
    Pass,
    Warn,
    Fail,
    #[allow(dead_code)]
    Info,
}

impl CheckResult {
    fn percentage(&self) -> f64 {
        if self.max_score == 0 {
            return 100.0;
        }
        (self.score as f64 / self.max_score as f64) * 100.0
    }

    fn icon(&self) -> &'static str {
        match self.status {
            CheckStatus::Pass => "✓",
            CheckStatus::Warn => "~",
            CheckStatus::Fail => "✗",
            CheckStatus::Info => "i",
        }
    }
}

// ── Audit checks ───────────────────────────────────────────────────────────────

fn check_agents_md(root: &Path) -> CheckResult {
    let path = root.join("AGENTS.md");
    let mut score = 0u32;
    let max_score = 20u32;
    let mut details = vec![];

    if !path.exists() {
        details.push("AGENTS.md not found".to_string());
        return CheckResult {
            name: "AGENTS.md",
            description: "Primary AI instruction file",
            score,
            max_score,
            status: CheckStatus::Fail,
            details,
        };
    }

    let content = fs::read_to_string(&path).unwrap_or_default();
    let word_count = content.split_whitespace().count();
    let line_count = content.lines().count();

    // Word count scoring (up to 8 pts)
    if word_count >= 2000 {
        score += 8;
        details.push(format!("Word count: {} (excellent)", word_count));
    } else if word_count >= 500 {
        score += 5;
        details.push(format!("Word count: {} (good, aim for 2000+)", word_count));
    } else if word_count >= 100 {
        score += 2;
        details.push(format!("Word count: {} (thin, expand it)", word_count));
    } else {
        details.push(format!("Word count: {} (too sparse)", word_count));
    }

    // Sections check (up to 6 pts)
    let section_patterns: &[(&str, &str)] = &[
        ("overview", "Overview section"),
        ("component", "Component documentation"),
        ("example", "Usage examples"),
        ("convention", "Coding conventions"),
        ("architecture", "Architecture overview"),
        ("install", "Installation/setup"),
    ];
    let mut sections_found = 0u32;
    let lower = content.to_lowercase();
    for (pat, label) in section_patterns {
        if lower.contains(pat) {
            sections_found += 1;
        } else {
            details.push(format!("Missing section: {}", label));
        }
    }
    let section_pts = (sections_found * 6 / section_patterns.len() as u32).min(6);
    score += section_pts;
    details.push(format!("Sections found: {}/{}", sections_found, section_patterns.len()));

    // Line count depth (up to 6 pts)
    if line_count >= 400 {
        score += 6;
    } else if line_count >= 100 {
        score += 3;
    } else {
        score += 1;
    }
    details.push(format!("Lines: {}", line_count));

    let status = if score >= 16 {
        CheckStatus::Pass
    } else if score >= 10 {
        CheckStatus::Warn
    } else {
        CheckStatus::Fail
    };

    CheckResult {
        name: "AGENTS.md",
        description: "Primary AI instruction file",
        score,
        max_score,
        status,
        details,
    }
}

fn check_cursorrules(root: &Path) -> CheckResult {
    let cursorrules_path = root.join(".cursorrules");
    let cursor_dir = root.join(".cursor").join("rules");

    let mut score = 0u32;
    let max_score = 8u32;
    let mut details = vec![];
    let status;

    if cursorrules_path.exists() {
        let content = fs::read_to_string(&cursorrules_path).unwrap_or_default();
        let word_count = content.split_whitespace().count();
        if word_count >= 200 {
            score += 8;
            details.push(format!(".cursorrules found ({} words)", word_count));
            status = CheckStatus::Pass;
        } else if word_count >= 50 {
            score += 4;
            details.push(format!(".cursorrules found but sparse ({} words, aim for 200+)", word_count));
            status = CheckStatus::Warn;
        } else {
            score += 1;
            details.push(format!(".cursorrules too brief ({} words)", word_count));
            status = CheckStatus::Fail;
        }
    } else if cursor_dir.exists() {
        let rule_count = fs::read_dir(&cursor_dir).map(|d| d.count()).unwrap_or(0);
        if rule_count > 0 {
            score += 6;
            details.push(format!(".cursor/rules/ found ({} rule files)", rule_count));
            status = CheckStatus::Warn;
        } else {
            details.push(".cursor/rules/ directory is empty".to_string());
            status = CheckStatus::Fail;
        }
    } else {
        details.push(".cursorrules not found (Cursor AI won't have project context)".to_string());
        status = CheckStatus::Fail;
    }

    CheckResult {
        name: ".cursorrules",
        description: "Cursor IDE context file",
        score,
        max_score,
        status,
        details,
    }
}

fn check_copilot_instructions(root: &Path) -> CheckResult {
    let paths = [
        root.join(".github").join("copilot-instructions.md"),
        root.join("copilot-instructions.md"),
    ];

    let mut score = 0u32;
    let max_score = 8u32;
    let mut details = vec![];
    let status;

    let found_path = paths.iter().find(|p| p.exists());

    if let Some(path) = found_path {
        let content = fs::read_to_string(path).unwrap_or_default();
        let word_count = content.split_whitespace().count();

        if word_count >= 200 {
            score += 8;
            details.push(format!(
                "copilot-instructions.md found ({} words) at {}",
                word_count,
                path.display()
            ));
            status = CheckStatus::Pass;
        } else if word_count >= 50 {
            score += 4;
            details.push(format!("copilot-instructions.md found but brief ({} words)", word_count));
            status = CheckStatus::Warn;
        } else {
            score += 1;
            details.push(format!("copilot-instructions.md is too sparse ({} words)", word_count));
            status = CheckStatus::Fail;
        }
    } else {
        details.push("copilot-instructions.md not found in .github/ or root".to_string());
        details.push("GitHub Copilot won't have project context".to_string());
        status = CheckStatus::Fail;
    }

    CheckResult {
        name: "copilot-instructions.md",
        description: "GitHub Copilot context file",
        score,
        max_score,
        status,
        details,
    }
}

fn check_claude_md(root: &Path) -> CheckResult {
    let path = root.join("CLAUDE.md");

    let mut score = 0u32;
    let max_score = 15u32;
    let mut details = vec![];

    if !path.exists() {
        details.push("CLAUDE.md not found (Claude Code won't have project context)".to_string());
        return CheckResult {
            name: "CLAUDE.md",
            description: "Claude Code project context",
            score,
            max_score,
            status: CheckStatus::Fail,
            details,
        };
    }

    let content = fs::read_to_string(&path).unwrap_or_default();
    let word_count = content.split_whitespace().count();
    let lower = content.to_lowercase();

    // Word count (up to 6 pts)
    if word_count >= 1000 {
        score += 6;
        details.push(format!("Word count: {} (comprehensive)", word_count));
    } else if word_count >= 300 {
        score += 4;
        details.push(format!("Word count: {} (decent)", word_count));
    } else if word_count >= 50 {
        score += 2;
        details.push(format!("Word count: {} (sparse, expand)", word_count));
    } else {
        details.push(format!("Word count: {} (too thin)", word_count));
    }

    // Key sections (up to 9 pts)
    let required_sections: &[(&str, &str)] = &[
        ("quick reference", "Quick Reference table"),
        ("architecture", "Architecture section"),
        ("commands", "Commands / scripts"),
        ("component", "Component catalog or index"),
        ("convention", "Coding conventions"),
        ("package", "Package info / imports"),
        ("file structure", "File structure overview"),
        ("test", "Testing instructions"),
        ("install", "Installation / setup"),
    ];
    let mut found = 0u32;
    for (pat, label) in required_sections {
        if lower.contains(pat) {
            found += 1;
        } else {
            details.push(format!("Missing: {}", label));
        }
    }
    let section_pts = (found * 9 / required_sections.len() as u32).min(9);
    score += section_pts;
    details.push(format!("Sections: {}/{}", found, required_sections.len()));

    let status = if score >= 12 {
        CheckStatus::Pass
    } else if score >= 8 {
        CheckStatus::Warn
    } else {
        CheckStatus::Fail
    };

    CheckResult {
        name: "CLAUDE.md",
        description: "Claude Code project context",
        score,
        max_score,
        status,
        details,
    }
}

fn check_llms_txt(root: &Path) -> CheckResult {
    let llms_path = root.join("llms.txt");
    let llms_full_path = root.join("llms-full.txt");

    let mut score = 0u32;
    let max_score = 15u32;
    let mut details = vec![];

    // llms.txt (up to 8 pts)
    if llms_path.exists() {
        let content = fs::read_to_string(&llms_path).unwrap_or_default();
        let line_count = content.lines().count();
        let word_count = content.split_whitespace().count();

        if word_count >= 500 {
            score += 8;
            details.push(format!("llms.txt: {} lines, {} words (good)", line_count, word_count));
        } else if word_count >= 100 {
            score += 5;
            details.push(format!(
                "llms.txt: {} lines, {} words (could be richer)",
                line_count, word_count
            ));
        } else {
            score += 2;
            details.push(format!(
                "llms.txt: {} lines, {} words (too sparse)",
                line_count, word_count
            ));
        }
    } else {
        details.push("llms.txt not found (standard llms.txt protocol not followed)".to_string());
    }

    // llms-full.txt (up to 7 pts)
    if llms_full_path.exists() {
        let content = fs::read_to_string(&llms_full_path).unwrap_or_default();
        let word_count = content.split_whitespace().count();

        if word_count >= 2000 {
            score += 7;
            details.push(format!("llms-full.txt: {} words (comprehensive)", word_count));
        } else if word_count >= 500 {
            score += 4;
            details.push(format!("llms-full.txt: {} words (decent)", word_count));
        } else {
            score += 2;
            details.push(format!("llms-full.txt: {} words (needs more content)", word_count));
        }
    } else {
        details.push("llms-full.txt not found (no full API reference for LLMs)".to_string());
    }

    let status = if score >= 12 {
        CheckStatus::Pass
    } else if score >= 7 {
        CheckStatus::Warn
    } else {
        CheckStatus::Fail
    };

    CheckResult {
        name: "llms.txt / llms-full.txt",
        description: "LLM-readable API reference",
        score,
        max_score,
        status,
        details,
    }
}

fn check_jsdoc_coverage(root: &Path) -> CheckResult {
    let mut total_exports = 0u32;
    let mut with_example = 0u32;
    let mut details = vec![];
    let max_score = 15u32;

    let src_root = root.join("src");
    if src_root.exists() {
        for entry in WalkDir::new(&src_root)
            .follow_links(false)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| {
                let path_str = e.path().to_string_lossy();
                let ext = e.path().extension().and_then(|s| s.to_str()).unwrap_or("");
                matches!(ext, "tsx" | "ts") && !path_str.contains(".test.")
            })
        {
            let content = fs::read_to_string(entry.path()).unwrap_or_default();

            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("export function")
                    || trimmed.starts_with("export const")
                    || trimmed.starts_with("export class")
                    || trimmed.starts_with("export default function")
                    || (trimmed.starts_with("export") && trimmed.contains("function"))
                {
                    total_exports += 1;
                }
            }

            let example_count = content.matches("@example").count() as u32;
            with_example += example_count;
        }
    }

    let coverage_pct = if total_exports > 0 {
        ((with_example as f64 / total_exports as f64) * 100.0).min(100.0)
    } else {
        0.0
    };

    details.push(format!(
        "Exports found: {}, @example blocks: {}",
        total_exports, with_example
    ));

    let (score, status) = if coverage_pct >= 50.0 {
        details.push(format!("Coverage: {:.1}% (good)", coverage_pct));
        (15u32, CheckStatus::Pass)
    } else if coverage_pct >= 20.0 {
        details.push(format!(
            "Coverage: {:.1}% (needs improvement, target 50%+)",
            coverage_pct
        ));
        (8u32, CheckStatus::Warn)
    } else if coverage_pct >= 5.0 {
        details.push(format!(
            "Coverage: {:.1}% (poor, add @example to exported functions)",
            coverage_pct
        ));
        (3u32, CheckStatus::Fail)
    } else {
        details.push(format!(
            "Coverage: {:.1}% (critical — no @example JSDoc found)",
            coverage_pct
        ));
        (0u32, CheckStatus::Fail)
    };

    CheckResult {
        name: "JSDoc @example coverage",
        description: "% of exports with @example JSDoc",
        score,
        max_score,
        status,
        details,
    }
}

fn check_ai_docs(root: &Path) -> CheckResult {
    let ai_docs_path = root.join("docs").join("ai");

    let mut score = 0u32;
    let max_score = 10u32;
    let mut details = vec![];

    if !ai_docs_path.exists() {
        details.push("docs/ai/ directory not found".to_string());
        details.push("Consider creating dedicated AI-readable documentation".to_string());
        return CheckResult {
            name: "docs/ai/*.md",
            description: "AI-specific documentation files",
            score,
            max_score,
            status: CheckStatus::Fail,
            details,
        };
    }

    let md_files: Vec<PathBuf> = fs::read_dir(&ai_docs_path)
        .map(|d| {
            d.filter_map(|e| e.ok())
                .filter(|e| {
                    e.path()
                        .extension()
                        .and_then(|s| s.to_str())
                        .map(|ext| ext == "md")
                        .unwrap_or(false)
                })
                .map(|e| e.path())
                .collect()
        })
        .unwrap_or_default();

    let file_count = md_files.len();
    details.push(format!("Found {} .md files in docs/ai/", file_count));

    let status;

    if file_count == 0 {
        details.push("docs/ai/ exists but has no .md files".to_string());
        status = CheckStatus::Fail;
    } else {
        score += (file_count as u32).min(5);

        let mut thin_files = 0u32;
        let mut total_words = 0u32;
        for path in &md_files {
            let content = fs::read_to_string(path).unwrap_or_default();
            let words = content.split_whitespace().count() as u32;
            total_words += words;
            if words < 50 {
                thin_files += 1;
                details.push(format!(
                    "Thin file: {} ({} words)",
                    path.file_name().unwrap_or_default().to_string_lossy(),
                    words
                ));
            }
        }

        let quality_ratio = if file_count > 0 {
            (file_count as u32 - thin_files) as f64 / file_count as f64
        } else {
            0.0
        };
        let quality_pts = (quality_ratio * 5.0) as u32;
        score += quality_pts;

        details.push(format!(
            "Total words: {}, thin files: {}/{}",
            total_words, thin_files, file_count
        ));

        status = if score >= 8 {
            CheckStatus::Pass
        } else if score >= 5 {
            CheckStatus::Warn
        } else {
            CheckStatus::Fail
        };
    }

    CheckResult {
        name: "docs/ai/*.md",
        description: "AI-specific documentation files",
        score,
        max_score,
        status,
        details,
    }
}

fn check_patterns_cookbook(root: &Path) -> CheckResult {
    let files: &[(PathBuf, &str)] = &[
        (root.join("PATTERNS.md"), "PATTERNS.md"),
        (root.join("COOKBOOK.md"), "COOKBOOK.md"),
        (root.join("PRINCIPLES.md"), "PRINCIPLES.md"),
        (root.join("docs").join("PATTERNS.md"), "docs/PATTERNS.md"),
        (root.join("docs").join("COOKBOOK.md"), "docs/COOKBOOK.md"),
    ];

    let mut score = 0u32;
    let max_score = 9u32;
    let mut details = vec![];

    let mut found_any = false;
    for (path, name) in files {
        if path.exists() {
            found_any = true;
            let content = fs::read_to_string(path).unwrap_or_default();
            let word_count = content.split_whitespace().count();
            let line_count = content.lines().count();

            if word_count >= 500 {
                score += 3;
                details.push(format!(
                    "{}: {} words, {} lines (thorough)",
                    name, word_count, line_count
                ));
            } else if word_count >= 100 {
                score += 2;
                details.push(format!("{}: {} words (decent but could expand)", name, word_count));
            } else {
                score += 1;
                details.push(format!("{}: {} words (very sparse)", name, word_count));
            }
        }
    }

    let status = if !found_any {
        details.push("No PATTERNS.md, COOKBOOK.md, or PRINCIPLES.md found".to_string());
        details.push("These files help AI understand idiomatic patterns".to_string());
        CheckStatus::Fail
    } else if score >= 7 {
        CheckStatus::Pass
    } else if score >= 4 {
        CheckStatus::Warn
    } else {
        CheckStatus::Fail
    };

    CheckResult {
        name: "PATTERNS.md / COOKBOOK.md",
        description: "Idiomatic pattern documentation",
        score,
        max_score,
        status,
        details,
    }
}

// ── Rendering helpers ─────────────────────────────────────────────────────────

fn score_color_str(score: u32, max: u32) -> String {
    let pct = if max > 0 { score * 100 / max } else { 100 };
    let s = format!("{}/{}", score, max);
    if pct >= 80 {
        s.green().bold().to_string()
    } else if pct >= 50 {
        s.yellow().bold().to_string()
    } else {
        s.red().bold().to_string()
    }
}

fn pct_bar(score: u32, max: u32, width: usize) -> String {
    let pct = if max > 0 { score as f64 / max as f64 } else { 1.0 };
    let filled = (pct * width as f64) as usize;
    let empty = width.saturating_sub(filled);

    let bar = format!("[{}{}]", "█".repeat(filled), "░".repeat(empty));

    if pct >= 0.8 {
        bar.green().to_string()
    } else if pct >= 0.5 {
        bar.yellow().to_string()
    } else {
        bar.red().to_string()
    }
}

fn print_header(path: &Path) {
    println!();
    println!(
        "{}",
        "╔══════════════════════════════════════════════════════════╗"
            .bright_blue()
            .bold()
    );
    println!(
        "{}  {}  {}",
        "║".bright_blue().bold(),
        "  sk-audit — AI Discoverability Scorer  ".white().bold(),
        "║".bright_blue().bold()
    );
    println!(
        "{}",
        "╚══════════════════════════════════════════════════════════╝"
            .bright_blue()
            .bold()
    );
    println!();
    println!(
        "  {} {}",
        "Project:".bright_black(),
        path.display().to_string().cyan().bold()
    );
    println!();
}

fn print_section_header(title: &str) {
    println!();
    println!(
        "  {} {}",
        "─────".bright_black(),
        title.white().bold()
    );
    println!();
}

fn render_results_table(results: &[CheckResult]) {
    let mut table = Table::new();
    table
        .load_preset(UTF8_FULL)
        .apply_modifier(UTF8_ROUND_CORNERS)
        .set_header(vec![
            Cell::new("Check")
                .add_attribute(Attribute::Bold)
                .fg(Color::Cyan),
            Cell::new("Description")
                .add_attribute(Attribute::Bold)
                .fg(Color::Cyan),
            Cell::new("Score")
                .add_attribute(Attribute::Bold)
                .fg(Color::Cyan),
            Cell::new("Progress")
                .add_attribute(Attribute::Bold)
                .fg(Color::Cyan),
            Cell::new("Status")
                .add_attribute(Attribute::Bold)
                .fg(Color::Cyan),
        ]);

    for result in results {
        let pct = result.percentage();
        let status_cell = match result.status {
            CheckStatus::Pass => Cell::new(format!("{} PASS", result.icon())).fg(Color::Green),
            CheckStatus::Warn => Cell::new(format!("{} WARN", result.icon())).fg(Color::Yellow),
            CheckStatus::Fail => Cell::new(format!("{} FAIL", result.icon())).fg(Color::Red),
            CheckStatus::Info => Cell::new(format!("{} INFO", result.icon())).fg(Color::Cyan),
        };

        let score_cell = if pct >= 80.0 {
            Cell::new(format!("{}/{}", result.score, result.max_score)).fg(Color::Green)
        } else if pct >= 50.0 {
            Cell::new(format!("{}/{}", result.score, result.max_score)).fg(Color::Yellow)
        } else {
            Cell::new(format!("{}/{}", result.score, result.max_score)).fg(Color::Red)
        };

        let bar_width = 16usize;
        let filled = (pct / 100.0 * bar_width as f64) as usize;
        let empty = bar_width.saturating_sub(filled);
        let bar = format!("[{}{}]", "█".repeat(filled), "░".repeat(empty));
        let bar_cell = if pct >= 80.0 {
            Cell::new(format!("{} {:.0}%", bar, pct)).fg(Color::Green)
        } else if pct >= 50.0 {
            Cell::new(format!("{} {:.0}%", bar, pct)).fg(Color::Yellow)
        } else {
            Cell::new(format!("{} {:.0}%", bar, pct)).fg(Color::Red)
        };

        table.add_row(vec![
            Cell::new(result.name).add_attribute(Attribute::Bold),
            Cell::new(result.description),
            score_cell,
            bar_cell,
            status_cell,
        ]);
    }

    println!("{table}");
}

fn render_details(results: &[CheckResult]) {
    print_section_header("Check Details");

    for result in results {
        let name_colored = match result.status {
            CheckStatus::Pass => format!("{} {}", "✓".green().bold(), result.name.green().bold()),
            CheckStatus::Warn => format!("{} {}", "~".yellow().bold(), result.name.yellow().bold()),
            CheckStatus::Fail => format!("{} {}", "✗".red().bold(), result.name.red().bold()),
            CheckStatus::Info => format!("{} {}", "i".cyan().bold(), result.name.cyan().bold()),
        };

        println!("  {}", name_colored);
        for detail in &result.details {
            println!("      {} {}", "·".bright_black(), detail.bright_black());
        }
        println!();
    }
}

fn render_final_score(results: &[CheckResult]) {
    let total_score: u32 = results.iter().map(|r| r.score).sum();
    let total_max: u32 = results.iter().map(|r| r.max_score).sum();
    let overall_pct = if total_max > 0 {
        total_score as f64 / total_max as f64 * 100.0
    } else {
        0.0
    };

    let pass_count = results.iter().filter(|r| r.status == CheckStatus::Pass).count();
    let warn_count = results.iter().filter(|r| r.status == CheckStatus::Warn).count();
    let fail_count = results.iter().filter(|r| r.status == CheckStatus::Fail).count();

    print_section_header("Overall AI Discoverability Score");

    let score_display = if overall_pct >= 80.0 {
        format!("{:.1}%", overall_pct).green().bold().to_string()
    } else if overall_pct >= 50.0 {
        format!("{:.1}%", overall_pct).yellow().bold().to_string()
    } else {
        format!("{:.1}%", overall_pct).red().bold().to_string()
    };

    println!("  {}", pct_bar(total_score, total_max, 40));
    println!();
    println!(
        "  {}  {}   {}  {}",
        "Score:".white().bold(),
        score_display,
        "Points:".bright_black(),
        score_color_str(total_score, total_max)
    );
    println!();
    println!(
        "  {} {}   {} {}   {} {}",
        "✓ Pass:".green(),
        pass_count,
        "~ Warn:".yellow(),
        warn_count,
        "✗ Fail:".red(),
        fail_count
    );
    println!();

    let threshold = 80.0f64;
    if overall_pct >= threshold {
        println!(
            "  {}  {}",
            "PASSED".on_green().black().bold(),
            format!("threshold: {:.0}%", threshold).bright_black()
        );
        println!();
        println!(
            "  {}",
            "This project has excellent AI discoverability.".green()
        );
    } else {
        println!(
            "  {}  {}",
            "NEEDS IMPROVEMENT".on_yellow().black().bold(),
            format!("threshold: {:.0}%, current: {:.1}%", threshold, overall_pct).bright_black()
        );
        println!();

        let failing: Vec<&CheckResult> = results
            .iter()
            .filter(|r| r.status == CheckStatus::Fail)
            .collect();
        if !failing.is_empty() {
            println!("  {} Fix these to improve your score:", "→".bright_blue());
            for r in failing.iter().take(3) {
                println!(
                    "      {} {} (potential +{} pts)",
                    "→".red(),
                    r.name,
                    r.max_score - r.score
                );
            }
        }
    }
    println!();
}

// ── Main ──────────────────────────────────────────────────────────────────────

fn run_audit(path: &Path) {
    print_header(path);

    if !path.exists() {
        eprintln!(
            "{} Path does not exist: {}",
            "Error:".red().bold(),
            path.display()
        );
        std::process::exit(1);
    }

    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::with_template("  {spinner:.cyan} {msg}")
            .unwrap()
            .tick_strings(&["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]),
    );
    pb.enable_steady_tick(Duration::from_millis(80));
    pb.set_message("Scanning project for AI discoverability signals...");

    type CheckFn = fn(&Path) -> CheckResult;
    let checks: &[(&str, CheckFn)] = &[
        ("AGENTS.md", check_agents_md),
        (".cursorrules", check_cursorrules),
        ("copilot-instructions.md", check_copilot_instructions),
        ("CLAUDE.md", check_claude_md),
        ("llms.txt / llms-full.txt", check_llms_txt),
        ("JSDoc @example", check_jsdoc_coverage),
        ("docs/ai/", check_ai_docs),
        ("PATTERNS.md / COOKBOOK.md", check_patterns_cookbook),
    ];

    let mut results: Vec<CheckResult> = Vec::new();
    for (name, check_fn) in checks {
        pb.set_message(format!("Checking {}...", name));
        results.push(check_fn(path));
    }

    pb.finish_and_clear();

    print_section_header("Audit Results");
    render_results_table(&results);
    render_details(&results);
    render_final_score(&results);
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Check { path } => {
            run_audit(path);
        }
    }
}
