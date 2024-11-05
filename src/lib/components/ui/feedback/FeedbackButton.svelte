<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { sendEmail } from '$lib/api';
	import { page } from '$app/stores';
	import { toastStore } from '$lib/stores/toast.store';

	export let showButton = true;

	let textarea: HTMLTextAreaElement;
	let modal: HTMLDialogElement;

	export const openFeedbackModal = writable(() => {});

	onMount(() => {
		modal = document.getElementById('feedback_modal') as HTMLDialogElement;

		openFeedbackModal.set(() => {
			modal.showModal();
		});
	});

	function closeModal() {
		modal.close();
	}

	function getBrowserInfo() {
		return {
			userAgent: navigator.userAgent,
			language: navigator.language,
			platform: navigator.platform,
			screenWidth: window.screen.width,
			screenHeight: window.screen.height
		};
	}

	function getUserInfo() {
		const session = $page.data.session;
		if (session && session.user) {
			return {
				id: session.user.id,
				name: session.user.name,
				email: session.user.email
			};
		}
		return null;
	}

	async function sendFeedback() {
		const feedback = textarea.value;
		const browserInfo = getBrowserInfo();
		const currentUrl = window.location.href;
		const userInfo = getUserInfo();

		const emailContent = `
			<html>
				<body>
					<h1>Feedback </h1>
					<h2>Feedback:</h2>
					<p style="font-size:18px;">${feedback.replace(/\n/g, '<br>')}</p>

					${
						userInfo
							? `
					<h2>User Information:</h2>
					<ul>
						<li><strong>User ID:</strong> ${userInfo.id}</li>
						<li><strong>Name:</strong> ${userInfo.name}</li>
						<li><strong>Email:</strong> ${userInfo.email}</li>
					</ul>
					`
							: '<p>User not logged in</p>'
					}

					<h2>Browser Information:</h2>
					<ul>
						<li><strong>User Agent:</strong> ${browserInfo.userAgent}</li>
						<li><strong>Language:</strong> ${browserInfo.language}</li>
						<li><strong>Platform:</strong> ${browserInfo.platform}</li>
						<li><strong>Screen Size:</strong> ${browserInfo.screenWidth}x${browserInfo.screenHeight}</li>
					</ul>

					<h2>URL:</h2>
					<p>${currentUrl}</p>
				</body>
			</html>
		`;

		try {
			const result = await sendEmail('Feedback from Chatdiamond', emailContent);
			console.log('Feedback result:', result);
			if (result.success) {
				toastStore.success(result.message);
				textarea.value = ''; // Clear the feedback input
				closeModal();
			} else {
				toastStore.error(result.message);
			}
		} catch (error) {
			console.error('Error sending feedback:', error);
			toastStore.error('Failed to send feedback. Please try again later.');
		}
	}
</script>

{#if showButton}
	<button class="btn btn-sm btn-primary" on:click={() => modal.showModal()}>Feedback</button>
{/if}

<dialog id="feedback_modal" class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Feedback</h3>
		<textarea
			bind:this={textarea}
			class="textarea w-full mt-10 ring-1 ring-secondary-focus ring-base-200"
			name="feedback"
			id="feedback"
			placeholder="Write your feedback here"
			rows="6"
		></textarea>
		<div class="modal-action justify-between">
			<button class="btn btn-ghost" on:click={closeModal}>Cancel</button>
			<button class="btn btn-primary" on:click={sendFeedback}>Send Feedback</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button on:click={closeModal}>Cancel</button>
	</form>
</dialog>
