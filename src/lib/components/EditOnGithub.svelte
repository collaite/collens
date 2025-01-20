<script lang="ts">
	import IconGithub from '~icons/lucide/github';
	import IconEdit from '~icons/lucide/edit-3';
	import { page } from '$app/stores';

	// https://github.com/collaite/collens/blob/main/src/routes/docs/parser-documentation/+page.md

	const baseEditUrl = 'https://github.com/collaite/collens/blob/main/src/routes';
	$: path = `docs/${$page.url.pathname.split('/').pop()}`;
	$: editUrl = `${baseEditUrl}/${path}/+page.md`;
</script>

<a href={editUrl} target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
	<IconGithub class="h-4 w-4" />
	<IconEdit class="h-4 w-4" />
	Edit on GitHub
</a>
