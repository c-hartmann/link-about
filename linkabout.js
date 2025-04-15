//
// linkabout.js
//

(function() {
	// detect about: occurences in page and replace with hyperlinks
	function linkifyAboutURLs() {
		// detetext those onyl that are *not* a link already or other interactive element
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: function(node) {
					// ignore text in script, style or anchor tags
					const parent = node.parentElement;
					if (!parent) return NodeFilter.FILTER_REJECT;

					const tagName = parent.tagName.toLowerCase();
					if (tagName === 'a' || tagName === 'button' || tagName === 'script' ||
						tagName === 'style' || tagName === 'textarea' || tagName === 'input') {
						return NodeFilter.FILTER_REJECT;
						}

						// test for about: occurence in current node
						if (node.textContent.match(/about:[a-zA-Z0-9]+/)) {
							return NodeFilter.FILTER_ACCEPT;
						}

						return NodeFilter.FILTER_SKIP;
				}
			}
		);

		// collect all detected text nodes in an array
		const nodesToProcess = [];
		let node;
		while ((node = walker.nextNode())) {
			nodesToProcess.push(node);
		}

		// work on detected text nodes last to first to keep all references in DOM tree valid
		for (let i = nodesToProcess.length - 1; i >= 0; i--) {
			const textNode = nodesToProcess[i];
			const text = textNode.textContent;

			// Regular expression to match URLs such as about:config
			const urlRegex = /(about:[a-zA-Z0-9]+)/g;

			// create new element and start with a container for that
			const fragment = document.createDocumentFragment();
			let lastIndex = 0;
			let match;

			// Finde alle URLs im Text
			//
			while ((match = urlRegex.exec(text)) !== null) {

				// start with a text from original
				if (match.index > lastIndex) {
					fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
				}

				// create link element
				const url = match[0];
				const link = document.createElement('a');
				link.href = url;
				link.textContent = url;
				link.style.color = '#FF3333';

				// leave traces of our doing for those interested
				link.setAttribute('data-generated-by', 'link-about');

				// append the new link element
				fragment.appendChild(link);

				lastIndex = match.index + match[0].length;
			}

			// finalize the new element with text again
			if (lastIndex < text.length) {
				fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
			}

			// replace original text node with new link node
			textNode.parentNode.replaceChild(fragment, textNode);
		}
	}

	// search and replace occurences of about:* on page loading
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', linkifyAboutURLs);
	} else {
		linkifyAboutURLs();
	}

	// create an observer in case the page will be modified later
	const observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.addedNodes && mutation.addedNodes.length > 0) {
				linkifyAboutURLs();
			}
		});
	});

	// run the observer
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
})();