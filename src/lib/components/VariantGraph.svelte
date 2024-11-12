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

	let nodes: Node[] = [];

	$: if (alignmentData) {
		const table = alignmentData.table;
		const witnesses = alignmentData.witnesses;
		nodes = [];

		const baseY = 150;
		const rowSpacing = 50;
		const colSpacing = 180;
		let currentX = 50;

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

		// Create "The black" node
		const theBlackNode: Node = {
			id: 'node_the_black',
			text: 'The black',
			x: currentX,
			y: baseY,
			column: 1,
			row: 1,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(theBlackNode);
		startNode.outgoing.set(
			theBlackNode.id,
			witnesses.map((w: string) => w.toString())
		);
		theBlackNode.incoming.set(
			startNode.id,
			witnesses.map((w: string) => w.toString())
		);
		currentX += colSpacing;

		// Create first row nodes (and, not)
		const andNode: Node = {
			id: 'node_and',
			text: 'and',
			x: currentX,
			y: baseY - rowSpacing,
			column: 2,
			row: 0,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(andNode);

		const notNode: Node = {
			id: 'node_not',
			text: 'not',
			x: currentX,
			y: baseY + rowSpacing,
			column: 2,
			row: 2,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(notNode);
		currentX += colSpacing;

		// Create second row nodes (white, green)
		const whiteNode: Node = {
			id: 'node_white',
			text: 'white',
			x: currentX,
			y: baseY - rowSpacing,
			column: 3,
			row: 0,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(whiteNode);

		const greenNode: Node = {
			id: 'node_green',
			text: 'green',
			x: currentX,
			y: baseY + rowSpacing,
			column: 3,
			row: 2,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(greenNode);

		const verySpecialNode: Node = {
			id: 'node_very_special',
			text: 'very special',
			x: currentX,
			y: baseY,
			column: 3,
			row: 1,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(verySpecialNode);
		currentX += colSpacing;

		// Create cat node
		const catNode: Node = {
			id: 'node_cat',
			text: 'cat',
			x: currentX,
			y: baseY,
			column: 4,
			row: 1,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(catNode);
		currentX += colSpacing;

		// Create end node
		const endNode: Node = {
			id: 'end',
			text: '',
			x: currentX,
			y: baseY,
			column: 5,
			row: 1,
			incoming: new Map(),
			outgoing: new Map()
		};
		nodes.push(endNode);

		// Connect nodes
		theBlackNode.outgoing.set(andNode.id, ['2', '3']);
		andNode.incoming.set(theBlackNode.id, ['2', '3']);

		theBlackNode.outgoing.set(notNode.id, ['5']);
		notNode.incoming.set(theBlackNode.id, ['5']);

		theBlackNode.outgoing.set(verySpecialNode.id, ['4']);
		verySpecialNode.incoming.set(theBlackNode.id, ['4']);

		andNode.outgoing.set(whiteNode.id, ['2']);
		whiteNode.incoming.set(andNode.id, ['2']);

		andNode.outgoing.set(greenNode.id, ['3']);
		greenNode.incoming.set(andNode.id, ['3']);

		notNode.outgoing.set(verySpecialNode.id, ['5']);
		verySpecialNode.incoming.set(notNode.id, ['5']);

		whiteNode.outgoing.set(catNode.id, ['2']);
		catNode.incoming.set(whiteNode.id, ['2']);

		greenNode.outgoing.set(catNode.id, ['3']);
		catNode.incoming.set(greenNode.id, ['3']);

		verySpecialNode.outgoing.set(catNode.id, ['4', '5']);
		catNode.incoming.set(verySpecialNode.id, ['4', '5']);

		catNode.outgoing.set(
			endNode.id,
			witnesses.map((w: string) => w.toString())
		);
		endNode.incoming.set(
			catNode.id,
			witnesses.map((w: string) => w.toString())
		);
	}

	function createPath(from: Node, to: Node) {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const columnDiff = to.column - from.column;

		// Adjust curve height based on path length and row positions
		const curveHeight = Math.abs(from.row - to.row) * 30;
		const midX = from.x + dx * 0.5;

		if (columnDiff > 1 || Math.abs(dy) > 50) {
			// Long paths or significant vertical difference - use curved path
			const cp1x = from.x + dx * 0.25;
			const cp2x = from.x + dx * 0.75;
			const cp1y = from.y + (dy < 0 ? -curveHeight : curveHeight);
			const cp2y = to.y + (dy < 0 ? curveHeight : -curveHeight);
			return `M ${from.x + 40} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x - 40} ${to.y}`;
		} else {
			// Short paths - use simple curve
			const cpY = from.y + dy / 2;
			return `M ${from.x + 40} ${from.y} Q ${midX} ${cpY} ${to.x - 40} ${to.y}`;
		}
	}
</script>

<div class="w-full overflow-x-auto">
	<svg width={1000} height="400" class="font-sans">
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
							y={(from.y + to.y) / 2 - 15}
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
				<ellipse cx="40" cy="20" rx="40" ry="20" fill="white" stroke="black" stroke-width="1" />
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
