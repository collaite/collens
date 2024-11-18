<script lang="ts">
	export let alignmentData: any;

	interface Node {
		id: string;
		text: string;
		x: number;
		y: number;
		column: number;
		row: number;
		incoming: Map<string, string[]>;
		outgoing: Map<string, string[]>;
	}

	const baseY = 200;
	const rowSpacing = 70;
	const colSpacing = 200;
	const circleRadius = 20;
	const ellipseWidth = 40;

	let nodes: Node[] = [];

	$: if (alignmentData) {
		const table = alignmentData.table;
		const witnesses = alignmentData.witnesses;
		nodes = [];

		let currentX = 100;

		// Create start node
		const startNode: Node = {
			id: 'start',
			text: '',
			x: currentX,
			y: baseY,
			column: 0,
			row: 1,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(startNode);
		currentX += colSpacing;

		// Process each column in the table
		let previousNodes = new Map<string, Node>(); // Track last node for each witness
		witnesses.forEach((witness) => {
			previousNodes.set(witness.toString(), startNode);
		});

		table.forEach((column: string[], columnIndex: number) => {
			// Group unique texts in this column
			const uniqueTexts = new Set(column.filter((text) => text.length > 0));
			const textToNode = new Map<string, Node>();

			// Create nodes for each unique text
			let rowOffset = 0;
			uniqueTexts.forEach((text) => {
				const nodeId = `node_${columnIndex}_${text.replace(/\s+/g, '_')}`;
				const node: Node = {
					id: nodeId,
					text: text,
					x: currentX,
					y: baseY + (rowOffset - (uniqueTexts.size - 1) / 2) * rowSpacing,
					column: columnIndex + 1,
					row: rowOffset,
					incoming: new Map(),
					outgoing: new Map()
				};
				nodes.push(node);
				textToNode.set(text, node);
				rowOffset++;
			});

			// Connect nodes based on witness paths
			column.forEach((text, witnessIndex) => {
				if (text.length > 0) {
					const witnessId = witnesses[witnessIndex].toString();
					const currentNode = textToNode.get(text);
					const previousNode = previousNodes.get(witnessId);

					if (currentNode && previousNode) {
						// Add connection from previous to current
						if (!previousNode.outgoing.has(currentNode.id)) {
							previousNode.outgoing.set(currentNode.id, []);
						}
						previousNode.outgoing.get(currentNode.id)?.push(witnessId);

						if (!currentNode.incoming.has(previousNode.id)) {
							currentNode.incoming.set(previousNode.id, []);
						}
						currentNode.incoming.get(previousNode.id)?.push(witnessId);

						// Update previous node for this witness
						previousNodes.set(witnessId, currentNode);
					}
				}
			});

			currentX += colSpacing;
		});

		// Create end node
		const endNode: Node = {
			id: 'end',
			text: '',
			x: currentX,
			y: baseY,
			column: table.length + 1,
			row: 1,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(endNode);

		// Connect last nodes to end node
		witnesses.forEach((witness) => {
			const lastNode = previousNodes.get(witness.toString());
			if (lastNode && lastNode !== startNode) {
				if (!lastNode.outgoing.has(endNode.id)) {
					lastNode.outgoing.set(endNode.id, []);
				}
				lastNode.outgoing.get(endNode.id)?.push(witness.toString());

				if (!endNode.incoming.has(lastNode.id)) {
					endNode.incoming.set(lastNode.id, []);
				}
				endNode.incoming.get(lastNode.id)?.push(witness.toString());
			}
		});
	}

	function getNodeOffset(node: Node): number {
		return node.id === 'start' || node.id === 'end' ? circleRadius : ellipseWidth;
	}

	function createPath(from: Node, to: Node) {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const midX = from.x + dx / 2;

		const fromOffset = getNodeOffset(from);
		const toOffset = getNodeOffset(to);

		// Determine if we should route above or below based on relative positions
		const shouldRouteAbove = from.row > to.row || (from.row === to.row && from.column < to.column);
		const curveHeight = shouldRouteAbove ? -40 : 40;

		// For nodes in the same row, use a straight line
		if (from.row === to.row && Math.abs(dx) < colSpacing * 1.5) {
			return `M ${from.x + fromOffset} ${from.y} L ${to.x - toOffset} ${to.y}`;
		}

		// For nodes in different rows or far apart, use a curved path
		const controlY = from.y + curveHeight;
		return `M ${from.x + fromOffset} ${from.y} Q ${midX} ${controlY} ${to.x - toOffset} ${to.y}`;
	}
</script>

<div class="w-full overflow-x-auto">
	<svg width={1200} height={400} class="font-sans">
		<!-- Edges -->
		{#each nodes as from}
			{#each Array.from(from.outgoing.entries()) as [toId, witnesses]}
				{@const to = nodes.find((n) => n.id === toId)}
				{#if to}
					<path
						d={createPath(from, to)}
						fill="none"
						stroke="black"
						stroke-width="1"
						marker-end="url(#arrowhead)"
					/>
					{#if witnesses.length > 0 && from.id !== 'start' && to.id !== 'end'}
						<text
							x={(from.x + to.x) / 2}
							y={from.y + (to.y > from.y ? 25 : -15)}
							text-anchor="middle"
							class="fill-gray-600 text-xs"
						>
							W{witnesses.join(', W')}
						</text>
					{/if}
				{/if}
			{/each}
		{/each}

		<!-- Nodes -->
		{#each nodes as node}
			<g transform="translate({node.x - 40}, {node.y - 20})">
				{#if node.id === 'start' || node.id === 'end'}
					<circle cx="40" cy="20" r="20" fill="white" stroke="black" stroke-width="1" />
				{:else}
					<ellipse cx="40" cy="20" rx="40" ry="20" fill="white" stroke="black" stroke-width="1" />
				{/if}
				<text x="40" y="20" text-anchor="middle" dominant-baseline="middle" class="text-sm">
					{node.text}
				</text>
			</g>
		{/each}

		<!-- Arrow marker definition -->
		<defs>
			<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
				<polygon points="0 0, 10 3.5, 0 7" fill="black" />
			</marker>
		</defs>
	</svg>
</div>
