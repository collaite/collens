<script>
	import LogOutButton from '$components/ui/Login/LogOutButton.svelte';
	import { page } from '$app/stores';
</script>

<div class="w-11/12">
	<div class="flex justify-center pb-10">
		<div class="avatar pointer-events-none select-none">
			<div class="w-40 mask mask-hexagon">
				<img
					class="!object-contain"
					src={$page.data?.session?.user?.image ?? '/images/avatar.webp'}
					alt="username"
				/>
			</div>
		</div>

		<div class="ml-10">
			<div class="">
				<div class="block leading-relaxed font-light text-3xl">
					{$page.data?.session?.user?.name || $page.data?.session?.user?.email.split('@')[0]}
				</div>
				<div class="block leading-relaxed font-light">
					{$page.data?.session?.user?.email}
				</div>
			</div>

			<!-- <pre>{JSON.stringify($page.data?.session?.user, null, 2)}</pre> -->

			<LogOutButton />
		</div>
	</div>
	<div class="border-b border-base-300" />
</div>
