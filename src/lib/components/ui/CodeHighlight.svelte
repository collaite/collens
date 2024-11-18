<script>
	import { onMount } from 'svelte';
	import Prism from 'prismjs';

	/** @type {string} */
	export let code = '';
	/** @type {string} */
	export let language = 'xml';

	/** @type {string} */
	let highlighted = '';

	function updateHighlight() {
		if (typeof window !== 'undefined' && code) {
			// Add XML language support
			Prism.languages.xml = Prism.languages.extend('markup', {});
			highlighted = Prism.highlight(code, Prism.languages.xml, 'xml');
		}
	}

	$: if (code) {
		updateHighlight();
	}

	onMount(() => {
		updateHighlight();
	});
</script>

<div class="code-block">
	<pre><code>{@html highlighted}</code></pre>
</div>

<style>
	.code-block {
		position: relative;
		margin: 1rem 0;
		padding: 1rem;
		border-radius: 0.5rem;
		color: brown;
		font-size: 12px;
	}

	pre {
		margin: 0;
		padding: 0;
		background: transparent;
		font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
			'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono',
			'Nimbus Mono L', 'Courier New', Courier, monospace;
		font-size: 12px;
		line-height: 1.375;
	}

	code {
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		background: transparent;
		white-space: pre;
		font-size: 13px !important;
		line-height: 13px !important;
	}

	:global(.token.comment),
	:global(.token.prolog),
	:global(.token.doctype),
	:global(.token.cdata) {
		color: #b6ad9a;
	}

	:global(.token.punctuation) {
		color: #b6ad9a;
	}

	:global(.token.tag),
	:global(.token.operator),
	:global(.token.number) {
		color: #063289;
	}

	:global(.token.property),
	:global(.token.function) {
		color: #b29762;
	}

	:global(.token.attr-name) {
		color: #896724;
	}

	:global(.token.attr-value),
	:global(.token.string) {
		color: #728fcb;
	}

	:global(.token.entity),
	:global(.token.url),
	:global(.token.keyword),
	:global(.token.control),
	:global(.token.directive),
	:global(.token.unit),
	:global(.token.statement),
	:global(.token.regex),
	:global(.token.atrule) {
		color: #728fcb;
	}

	:global(.token.placeholder),
	:global(.token.variable) {
		color: #93abdc;
	}

	:global(.token.important) {
		color: #896724;
		font-weight: bold;
	}

	:global(.token.entity) {
		cursor: help;
	}
</style>
