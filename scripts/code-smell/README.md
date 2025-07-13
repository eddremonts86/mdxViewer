# Code Smell Detection Tool - Modular Structure

This directory contains the refactored code smell detection tool, now split into specialized modules for better maintainability.

## Structure

### Main Files

- **`../code-smell-detector.ts`** - Main entry point that orchestrates the analysis

### Modules (`code-smell/` directory)

#### Core Types

- **`types.ts`** - Type definitions and interfaces
    - `CodeSmell` interface
    - `SmellReport` interface
    - ESLint result types

#### Configuration

- **`constants.ts`** - Constants and configuration
    - Smell categories mapping
    - Rule-to-category mappings
    - ESLint command configuration

#### Analysis Engine

- **`eslint-runner.ts`** - ESLint execution and parsing
    - `runESLint()` - Executes ESLint command
    - `parseESLintOutput()` - Parses ESLint JSON output into CodeSmell objects

#### Intelligence Layer

- **`recommendations.ts`** - Recommendation generation logic
    - `generateRecommendations()` - Analyzes smells and generates actionable recommendations

#### Reporting

- **`html-reporter.ts`** - HTML report generation
    - `generateHTMLReport()` - Creates interactive HTML reports
    - Helper functions for different report sections

- **`report-builder.ts`** - Report building and file operations
    - `buildReport()` - Builds complete SmellReport from CodeSmell array
    - `writeReports()` - Writes HTML and JSON reports to disk
    - `logResults()` - Console output formatting

## Benefits of This Structure

### 🔧 **Maintainability**

- Each module has a single responsibility
- Changes to one area don't affect others
- Easier to test individual components

### 📈 **Scalability**

- Easy to add new report formats
- Simple to extend with new analysis rules
- Straightforward to add new recommendation logic

### 🔍 **Readability**

- Clear separation of concerns
- Self-documenting module names
- Smaller, focused functions

### 🧪 **Testability**

- Each module can be unit tested independently
- Dependencies are explicit through imports
- Pure functions are easier to test

## Usage

The main script works exactly the same as before:

```bash
npx ts-node scripts/code-smell-detector.ts
```

## Adding New Features

### New Smell Categories

1. Add to `SMELL_CATEGORIES` in `constants.ts`
2. Map rules in `RULE_CATEGORIES`

### New Report Format

1. Create new reporter module (e.g., `pdf-reporter.ts`)
2. Add to `writeReports()` in `report-builder.ts`

### New Recommendations

1. Add logic to `generateRecommendations()` in `recommendations.ts`

### New Analysis Source

1. Create new runner module (e.g., `tsc-runner.ts`)
2. Import and use in main `../code-smell-detector.ts`
