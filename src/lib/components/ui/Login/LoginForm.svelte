<script lang="ts">
	// import Logo from '$lib/assets/icons/Logo.svelte';
	import BiGoogle from '~icons/bi/google';
	import MingcuteMailSendLine from '~icons/mingcute/mail-send-line';
	import PhKeyBold from '~icons/ph/key-bold';
	import { signIn } from '@auth/sveltekit/client';

	let email = '';
	let password = '';
	let error = '';

	let openCredentials = false;
	let openMagicLink = true;

	function handleGoogleSignIn() {
		signIn('google');
	}

	async function handleEmailSignIn() {
		const result = await signIn('Credentials', {
			email,
			password
		});
		if (result?.ok) {
			closeModal();
		} else {
			error = 'User authorization failed';
			console.error('User authorization failed', result);
		}
	}

	function handleMagicLinkSignIn() {
		signIn('resend', { email });
	}

	function loginWithSocialProvider(provider: string) {
		signIn(provider);
	}
	function closeModal() {
		document.getElementById('login-modal').checked = false;
	}
</script>

<div>
	<h1 class="font-bold text-center text-2xl mb-5">Login Access</h1>
	<div class="flex flex-col gap-4 p-5">
		<button
			type="button"
			class="btn btn-primary"
			on:click={() => loginWithSocialProvider('google')}
		>
			<BiGoogle />
			Login with Google
		</button>

		<div class="mt-3"></div>
		<button
			class="btn"
			class:hidden={openMagicLink}
			on:click={() => (openMagicLink = !openMagicLink)}
		>
			<MingcuteMailSendLine class="size-5" />
			Send Magic Link
		</button>
		<form
			class="p-3 border rounded-box border-base-300"
			class:hidden={!openMagicLink}
			on:submit|preventDefault={handleMagicLinkSignIn}
		>
			<div class="form-control">
				<input
					bind:value={email}
					autofocus
					type="email"
					placeholder="Enter your email"
					class="input input-bordered"
					required
				/>
			</div>

			{#if error}
				<div class="text-error mt-2">{error}</div>
			{/if}

			<button type="submit" class="btn w-full mt-3 btn-outline btn-secondary">
				<MingcuteMailSendLine class="size-5" />
				Send Magic Link
			</button>
		</form>

		<!-- Login with Email and Password -->
		<!--
		<button
			class="btn"
			class:hidden={openCredentials}
			on:click={() => (openCredentials = !openCredentials)}
		>
			<PhKeyBold class="size-5" />
			Email and Password
		</button>

		<form
			class="p-3 border rounded-box border-base-300"
			class:hidden={!openCredentials}
			on:submit|preventDefault={handleEmailSignIn}
		>
			<div class="form-control">
				<input
					bind:value={email}
					type="email"
					placeholder="Enter your email"
					class="input input-bordered"
					required
				/>
			</div>

			<div class="form-control mt-3">
				<input
					bind:value={password}
					type="password"
					placeholder="Enter your password"
					class="input input-bordered"
					required
				/>
			</div>

			{#if error}
				<div class="text-error mt-2">{error}</div>
			{/if}

			<button type="submit" class="btn w-full mt-3 btn-outline btn-secondary">
				<PhKeyBold class="size-5" />
				Login with Email and Password
			</button>
		</form>
		-->
	</div>
</div>
