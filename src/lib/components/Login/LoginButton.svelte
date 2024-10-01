<script lang="ts">
	import { page } from '$app/stores';
	import LoginForm from './LoginForm.svelte';
</script>

<div>
	<!-- Logged in -->
	<!--    v-if="isLoggedIn()" -->
	{#if $page.data.session}
		<a
			href="/profile"
			class="hover:bg-base-200 transition rounded-full h-12 w-12 flex items-center justify-center active:scale-95"
		>
			<img
				alt="User avatar"
				class="cursor-pointer h-8 w-8 rounded-full"
				src={$page.data?.session?.user?.image ?? '/images/avatar.webp'}
				referrerpolicy="no-referrer"
			/>
		</a>
		<!-- Not logged in-->
	{:else}
		<div>
			<div>
				<label for="login-modal" class="btn btn-primary btn-md modal-button">Login access</label>
				<input id="login-modal" type="checkbox" class="modal-toggle" />
				<div class="modal h-screen">
					<div class="modal-box">
						<LoginForm />

						<div class="modal-action">
							<label for="login-modal" class="btn">Close</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
