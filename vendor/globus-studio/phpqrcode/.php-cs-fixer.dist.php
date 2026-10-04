<?php

$finder = PhpCsFixer\Finder::create()
    ->in([__DIR__ . '/src', __DIR__ . '/tests']);

return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true,
        'declare_strict_types' => true,
        'no_unused_imports' => true,
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
        'single_quote' => true,
        'no_trailing_whitespace' => true,
        'no_whitespace_in_blank_line' => true,
        'array_syntax' => ['syntax' => 'short'],
        'blank_line_before_statement' => ['statements' => ['return']],
        'no_closing_tag' => true,
        'trailing_comma_in_multiline' => ['elements' => ['arrays']],
    ])
    ->setFinder($finder)
    ->setRiskyAllowed(true);
