<script>
	import { onMount } from 'svelte';
	import { basicSetup, EditorView } from 'codemirror';
	import { xml } from '@codemirror/lang-xml';

	/** @type {string} */
	export let code = '';
	/** @type {string} */
	export let language = 'xml';

	/** @type {EditorView | null} */
	let view = null;
	/** @type {HTMLElement} */
	let element;

	onMount(() => {
		view = new EditorView({
			doc: code,
			parent: element,
			extensions: [
				basicSetup,
				xml(),
				EditorView.editable.of(false),
				EditorView.theme({
					'&': {
						fontSize: '13px',
						height: '100%',
						backgroundColor: 'transparent'
					},
					'.cm-content': {
						fontFamily: 'Consolas, Menlo, Monaco, monospace',
						color: '#063289'
					},
					'.cm-gutters': {
						backgroundColor: 'transparent',
						border: 'none',
						borderRight: '1px solid rgba(0, 0, 0, 0.1)'
					},
					'.cm-foldGutter': {
						color: 'var(--primary)'
					},
					'.cm-foldGutter .cm-gutterElement': {
						cursor: 'pointer'
					},
					'.cm-line': {
						padding: '0 4px'
					},
					'.cm-activeLineGutter': {
						backgroundColor: 'transparent'
					},
					'.cm-selectionBackground': {
						backgroundColor: 'rgba(0, 0, 0, 0.1)'
					},
					'&.cm-focused': {
						outline: 'none'
					},
					'.cm-xml-tagname': {
						color: '#063289'
					},
					'.cm-xml-attribute': {
						color: '#896724'
					},
					'.cm-xml-string': {
						color: '#728fcb'
					}
				})
			]
		});

		return () => {
			if (view) {
				view.destroy();
			}
		};
	});

	$: if (view && code) {
		const transaction = view.state.update({
			changes: { from: 0, to: view.state.doc.length, insert: code }
		});
		view.dispatch(transaction);
	}
</script>

<div class="code-block !m-0 !p-0" bind:this={element} />

<style>
	.code-block {
		position: relative;
		margin: 1rem 0;
		padding: 1rem;
		border-radius: 0.5rem;
		min-height: 400px;
		overflow: hidden;
		background-color: #e6e2cf;
	}

	:global(.cm-editor) {
		height: 100%;
		min-height: 400px;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}
	:global(.cm-gutters) {
		@apply !bg-base-300;
		user-select: none;
	}

	:global(.cm-focused) {
		outline: none !important;
	}
</style>
