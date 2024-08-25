
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	function action_destroyer(action_result) {
		return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/** @returns {number} */
	function to_number(value) {
		return value === '' ? null : +value;
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data(text, data) {
		data = '' + data;
		if (text.data === data) return;
		text.data = /** @type {string} */ (data);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	const PUBLIC_VERSION = '4';

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	function styleInject(css, ref) {
	  if ( ref === void 0 ) ref = {};
	  var insertAt = ref.insertAt;

	  if (!css || typeof document === 'undefined') { return; }

	  var head = document.head || document.getElementsByTagName('head')[0];
	  var style = document.createElement('style');
	  style.type = 'text/css';

	  if (insertAt === 'top') {
	    if (head.firstChild) {
	      head.insertBefore(style, head.firstChild);
	    } else {
	      head.appendChild(style);
	    }
	  } else {
	    head.appendChild(style);
	  }

	  if (style.styleSheet) {
	    style.styleSheet.cssText = css;
	  } else {
	    style.appendChild(document.createTextNode(css));
	  }
	}

	var css_248z$2 = ".component[name=image-compare-slider].svelte-wsuvmk{position:relative;max-height:var(--height);width:fit-content;user-select:none;touch-action:none}img.svelte-wsuvmk{max-height:var(--height);max-width:80vw}img.background-img.svelte-wsuvmk{position:relative}.overlay.svelte-wsuvmk{position:absolute;top:0;left:0;height:inherit;overflow:hidden;box-sizing:border-box;box-shadow:calc(var(--slideWidth)/2* 1px) 0px 0px var(--slideColor);border-right:solid;border-right-width:calc(var(--slideWidth)/2* 1px);border-right-color:var(--slideColor);opacity:var(--overlayOpacity)}.handle.svelte-wsuvmk{position:absolute;height:calc(var(--handleSize)*1px);width:calc(var(--handleSize)*1px);border:solid;border-width:calc(var(--handleGirth)*1px);border-radius:3px;border-color:var(--handleColor);transform:rotate(-45deg);mask:radial-gradient(circle 10px at top right, #0000 100%,var(--handleColor)) top right,\r\n          radial-gradient(circle 10px at bottom left, #0000 98%, var(--handleColor)) bottom left;mask-size:50%;mask-repeat:no-repeat;opacity:var(--handleOpacity);cursor:grab}";
	styleInject(css_248z$2);

	/* src\ImageCompareSlider.svelte generated by Svelte v4.2.8 */

	const { window: window_1 } = globals;

	function create_else_block(ctx) {
		let img_1;
		let img_1_src_value;

		return {
			c() {
				img_1 = element("img");
				attr(img_1, "class", "unique-img svelte-wsuvmk");
				if (!src_url_equal(img_1.src, img_1_src_value = /*src*/ ctx[15])) attr(img_1, "src", img_1_src_value);
				attr(img_1, "alt", /*alt*/ ctx[16]);
				attr(img_1, "onerror", "this.onerror=null;this.src=/error404.png");
			},
			m(target, anchor) {
				insert(target, img_1, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*src*/ 32768 && !src_url_equal(img_1.src, img_1_src_value = /*src*/ ctx[15])) {
					attr(img_1, "src", img_1_src_value);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(img_1);
				}
			}
		};
	}

	// (96:2) {#if !src}
	function create_if_block$1(ctx) {
		let img0;
		let img0_src_value;
		let t0;
		let div0;
		let img1;
		let img1_src_value;
		let t1;
		let div1;
		let mounted;
		let dispose;

		return {
			c() {
				img0 = element("img");
				t0 = space();
				div0 = element("div");
				img1 = element("img");
				t1 = space();
				div1 = element("div");
				attr(img0, "class", "background-img svelte-wsuvmk");
				if (!src_url_equal(img0.src, img0_src_value = /*backSrc*/ ctx[4])) attr(img0, "src", img0_src_value);
				attr(img0, "alt", /*backAlt*/ ctx[2]);
				attr(img1, "class", "foreground-img svelte-wsuvmk");
				if (!src_url_equal(img1.src, img1_src_value = /*frontSrc*/ ctx[3])) attr(img1, "src", img1_src_value);
				attr(img1, "alt", /*frontAlt*/ ctx[1]);
				attr(div0, "class", "overlay svelte-wsuvmk");
				set_style(div0, "--slideColor", /*slideColor*/ ctx[5]);
				set_style(div0, "--slideWidth", /*slideWidth*/ ctx[6]);
				set_style(div0, "--overlayOpacity", /*overlayOpacity*/ ctx[7]);
				attr(div1, "class", "handle svelte-wsuvmk");
				set_style(div1, "--handleColor", /*handleColor*/ ctx[8]);
				set_style(div1, "--handleSize", /*handleSize*/ ctx[9]);
				set_style(div1, "--handleGirth", /*handleGirth*/ ctx[10]);
				set_style(div1, "--handleOpacity", /*handleOpacity*/ ctx[11]);
				attr(div1, "role", "slider");
				attr(div1, "aria-valuenow", "0");
				attr(div1, "tabindex", "-1");
			},
			m(target, anchor) {
				insert(target, img0, anchor);
				/*img0_binding*/ ctx[20](img0);
				insert(target, t0, anchor);
				insert(target, div0, anchor);
				append(div0, img1);
				/*div0_binding*/ ctx[21](div0);
				insert(target, t1, anchor);
				insert(target, div1, anchor);
				/*div1_binding*/ ctx[22](div1);

				if (!mounted) {
					dispose = [
						listen(img0, "load", /*setHandlePosition*/ ctx[18]),
						listen(div1, "mousedown", /*move*/ ctx[19]),
						listen(div1, "touchstart", /*move*/ ctx[19], { passive: true })
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*backSrc*/ 16 && !src_url_equal(img0.src, img0_src_value = /*backSrc*/ ctx[4])) {
					attr(img0, "src", img0_src_value);
				}

				if (dirty & /*backAlt*/ 4) {
					attr(img0, "alt", /*backAlt*/ ctx[2]);
				}

				if (dirty & /*frontSrc*/ 8 && !src_url_equal(img1.src, img1_src_value = /*frontSrc*/ ctx[3])) {
					attr(img1, "src", img1_src_value);
				}

				if (dirty & /*frontAlt*/ 2) {
					attr(img1, "alt", /*frontAlt*/ ctx[1]);
				}

				if (dirty & /*slideColor*/ 32) {
					set_style(div0, "--slideColor", /*slideColor*/ ctx[5]);
				}

				if (dirty & /*slideWidth*/ 64) {
					set_style(div0, "--slideWidth", /*slideWidth*/ ctx[6]);
				}

				if (dirty & /*overlayOpacity*/ 128) {
					set_style(div0, "--overlayOpacity", /*overlayOpacity*/ ctx[7]);
				}

				if (dirty & /*handleColor*/ 256) {
					set_style(div1, "--handleColor", /*handleColor*/ ctx[8]);
				}

				if (dirty & /*handleSize*/ 512) {
					set_style(div1, "--handleSize", /*handleSize*/ ctx[9]);
				}

				if (dirty & /*handleGirth*/ 1024) {
					set_style(div1, "--handleGirth", /*handleGirth*/ ctx[10]);
				}

				if (dirty & /*handleOpacity*/ 2048) {
					set_style(div1, "--handleOpacity", /*handleOpacity*/ ctx[11]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(img0);
					detach(t0);
					detach(div0);
					detach(t1);
					detach(div1);
				}

				/*img0_binding*/ ctx[20](null);
				/*div0_binding*/ ctx[21](null);
				/*div1_binding*/ ctx[22](null);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$4(ctx) {
		let div;
		let mounted;
		let dispose;

		function select_block_type(ctx, dirty) {
			if (!/*src*/ ctx[15]) return create_if_block$1;
			return create_else_block;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		return {
			c() {
				div = element("div");
				if_block.c();
				attr(div, "name", "image-compare-slider");
				attr(div, "class", "component svelte-wsuvmk");
				set_style(div, "--height", /*height*/ ctx[0]);
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if_block.m(div, null);

				if (!mounted) {
					dispose = [
						listen(window_1, "resize", /*setHandlePosition*/ ctx[18]),
						action_destroyer(/*init*/ ctx[17].call(null, div))
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div, null);
					}
				}

				if (dirty & /*height*/ 1) {
					set_style(div, "--height", /*height*/ ctx[0]);
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if_block.d();
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { height = "250px", frontAlt = "Missing foreground img", backAlt = "Missing background img", frontSrc = null, backSrc = null } = $$props;
		let { slideColor = "white", slideWidth = "3" } = $$props;
		let { overlayOpacity = "1" } = $$props;
		let { handleColor = "white", handleSize = "20", handleGirth = "3", handleOpacity = "1" } = $$props;
		let img, overlay, handle, limitBack, limitfront;
		let src, alt; //used if only one src is defined

		function init() {
			checkUniqueSrc(backSrc, frontSrc);
		}

		function checkUniqueSrc(backSrc, frontSrc) {
			if (!backSrc || !frontSrc) {
				$$invalidate(15, src = backSrc ? backSrc : frontSrc);
				return;
			}

			try {
				front_img.src = frontSrc;
				back_img.src = backSrc;

				front_img.onerror = function (e) {
					//this.onerror=null;
					$$invalidate(15, src = backSrc);
				};

				back_img.onerror = function (e) {
					//this.onerror=null;
					$$invalidate(15, src = frontSrc);
				};
			} catch(error) {
				
			} //this.onerror=null;
		}

		function setHandlePosition() {
			if (!img) return;
			limitBack = img.getBoundingClientRect().left;
			limitfront = img.getBoundingClientRect().right;
			const size = limitfront - limitBack;
			const centerDiagonal = handle.getBoundingClientRect().width / 2 - Math.SQRT2 * handleGirth;
			$$invalidate(13, overlay.style.width = size * 0.5 + "px", overlay); //init overlay position
			$$invalidate(14, handle.style.left = size * 0.5 - centerDiagonal + "px", handle); //init overlay position
			$$invalidate(14, handle.style.top = "50%", handle); //init overlay position
		}

		function move() {
			if (!img) return;
			limitBack = img.getBoundingClientRect().left;
			limitfront = img.getBoundingClientRect().right;
			window.addEventListener("touchmove", moveSlider);
			window.addEventListener("mousemove", moveSlider);

			function moveSlider(e) {
				let x = (e.type === "touchmove" ? e.touches[0] : e).pageX;

				if (x <= limitBack) {
					x = limitBack;
				} else if (x >= limitfront) {
					x = limitfront;
				}

				const centerDiagonal = handle.getBoundingClientRect().width / 2 - Math.SQRT2 * handleGirth;
				const x_shift = x - limitBack;
				$$invalidate(14, handle.style.left = x_shift - centerDiagonal + "px", handle);
				$$invalidate(13, overlay.style.width = x_shift + "px", overlay);
			}

			/**
	 * Remove listeners
	*/
			window.addEventListener("touchend", removeListener);

			window.addEventListener("mouseup", removeListener);

			function removeListener() {
				window.removeEventListener("touchmove", moveSlider);
				window.removeEventListener("mousemove", moveSlider);
				window.removeEventListener("touchend", removeListener);
				window.removeEventListener("mouseup", removeListener);
			}
		} //end move()

		function img0_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				img = $$value;
				$$invalidate(12, img);
			});
		}

		function div0_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				overlay = $$value;
				$$invalidate(13, overlay);
			});
		}

		function div1_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				handle = $$value;
				$$invalidate(14, handle);
			});
		}

		$$self.$$set = $$props => {
			if ('height' in $$props) $$invalidate(0, height = $$props.height);
			if ('frontAlt' in $$props) $$invalidate(1, frontAlt = $$props.frontAlt);
			if ('backAlt' in $$props) $$invalidate(2, backAlt = $$props.backAlt);
			if ('frontSrc' in $$props) $$invalidate(3, frontSrc = $$props.frontSrc);
			if ('backSrc' in $$props) $$invalidate(4, backSrc = $$props.backSrc);
			if ('slideColor' in $$props) $$invalidate(5, slideColor = $$props.slideColor);
			if ('slideWidth' in $$props) $$invalidate(6, slideWidth = $$props.slideWidth);
			if ('overlayOpacity' in $$props) $$invalidate(7, overlayOpacity = $$props.overlayOpacity);
			if ('handleColor' in $$props) $$invalidate(8, handleColor = $$props.handleColor);
			if ('handleSize' in $$props) $$invalidate(9, handleSize = $$props.handleSize);
			if ('handleGirth' in $$props) $$invalidate(10, handleGirth = $$props.handleGirth);
			if ('handleOpacity' in $$props) $$invalidate(11, handleOpacity = $$props.handleOpacity);
		};

		return [
			height,
			frontAlt,
			backAlt,
			frontSrc,
			backSrc,
			slideColor,
			slideWidth,
			overlayOpacity,
			handleColor,
			handleSize,
			handleGirth,
			handleOpacity,
			img,
			overlay,
			handle,
			src,
			alt,
			init,
			setHandlePosition,
			move,
			img0_binding,
			div0_binding,
			div1_binding
		];
	}

	class ImageCompareSlider extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$3, create_fragment$4, safe_not_equal, {
				height: 0,
				frontAlt: 1,
				backAlt: 2,
				frontSrc: 3,
				backSrc: 4,
				slideColor: 5,
				slideWidth: 6,
				overlayOpacity: 7,
				handleColor: 8,
				handleSize: 9,
				handleGirth: 10,
				handleOpacity: 11
			});
		}
	}

	/* test\section\Default.svelte generated by Svelte v4.2.8 */

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i].element;
		child_ctx[7] = list[i].feature;
		child_ctx[8] = list[i].value;
		return child_ctx;
	}

	// (40:6) {#each tableContent as {element, feature, value}}
	function create_each_block$2(ctx) {
		let tr;
		let td0;
		let t1;
		let td1;
		let t3;
		let td2;
		let t5;

		return {
			c() {
				tr = element("tr");
				td0 = element("td");
				td0.textContent = `${/*element*/ ctx[6]}`;
				t1 = space();
				td1 = element("td");
				td1.textContent = `${/*feature*/ ctx[7]}`;
				t3 = space();
				td2 = element("td");
				td2.textContent = `${/*value*/ ctx[8]}`;
				t5 = space();
			},
			m(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				append(tr, t1);
				append(tr, td1);
				append(tr, t3);
				append(tr, td2);
				append(tr, t5);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(tr);
				}
			}
		};
	}

	function create_fragment$3(ctx) {
		let div1;
		let h2;
		let t1;
		let div0;
		let imagecompareslider;
		let t2;
		let h30;
		let t4;
		let table;
		let thead;
		let t9;
		let tbody;
		let t10;
		let h31;
		let t12;
		let pre;
		let t13;
		let code;
		let t14;
		let t15;
		let t16;
		let t17;
		let t18;
		let t19;
		let t20;
		let t21;
		let current;

		imagecompareslider = new ImageCompareSlider({
				props: {
					height: /*height*/ ctx[0],
					backSrc: /*imgBack_src*/ ctx[4],
					backAlt: /*imgBack_alt*/ ctx[2],
					frontSrc: /*imgFront_src*/ ctx[3],
					frontAlt: /*imgFront_alt*/ ctx[1]
				}
			});

		let each_value = ensure_array_like(/*tableContent*/ ctx[5]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		}

		return {
			c() {
				div1 = element("div");
				h2 = element("h2");
				h2.textContent = "Default demo";
				t1 = space();
				div0 = element("div");
				create_component(imagecompareslider.$$.fragment);
				t2 = space();
				h30 = element("h3");
				h30.textContent = "Default characterics";
				t4 = space();
				table = element("table");
				thead = element("thead");
				thead.innerHTML = `<tr><th></th> <th>Feature</th> <th>Value</th></tr>`;
				t9 = space();
				tbody = element("tbody");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t10 = space();
				h31 = element("h3");
				h31.textContent = "Snippet code";
				t12 = space();
				pre = element("pre");
				t13 = text("    ");
				code = element("code");
				t14 = text("\r\n<script>\r\n  import ImageCompareSlider from '../src/ImageCompareSlider.svelte'\r\n</script>\r\n\r\n<div>\r\n  <ImageCompareSlider\r\n    height=\"");
				t15 = text(/*height*/ ctx[0]);
				t16 = text("\"\r\n    backSrc=\"path_BackgroundImg\"\r\n    backAlt=\"");
				t17 = text(/*imgBack_alt*/ ctx[2]);
				t18 = text("\"\r\n    frontSrc=\"path_BackgroundImg\"\r\n    frontAlt=\"");
				t19 = text(/*imgFront_alt*/ ctx[1]);
				t20 = text("\"\r\n  />\r\n</div>\r\n    ");
				t21 = text("\r\n  ");
				attr(div0, "class", "container");
				attr(code, "class", "language-html");
				attr(pre, "class", "snippet");
				attr(div1, "id", "default-component");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, h2);
				append(div1, t1);
				append(div1, div0);
				mount_component(imagecompareslider, div0, null);
				append(div1, t2);
				append(div1, h30);
				append(div1, t4);
				append(div1, table);
				append(table, thead);
				append(table, t9);
				append(table, tbody);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(tbody, null);
					}
				}

				append(div1, t10);
				append(div1, h31);
				append(div1, t12);
				append(div1, pre);
				append(pre, t13);
				append(pre, code);
				append(code, t14);
				append(code, t15);
				append(code, t16);
				append(code, t17);
				append(code, t18);
				append(code, t19);
				append(code, t20);
				append(pre, t21);
				current = true;
			},
			p(ctx, [dirty]) {
				const imagecompareslider_changes = {};
				if (dirty & /*height*/ 1) imagecompareslider_changes.height = /*height*/ ctx[0];
				if (dirty & /*imgBack_src*/ 16) imagecompareslider_changes.backSrc = /*imgBack_src*/ ctx[4];
				if (dirty & /*imgBack_alt*/ 4) imagecompareslider_changes.backAlt = /*imgBack_alt*/ ctx[2];
				if (dirty & /*imgFront_src*/ 8) imagecompareslider_changes.frontSrc = /*imgFront_src*/ ctx[3];
				if (dirty & /*imgFront_alt*/ 2) imagecompareslider_changes.frontAlt = /*imgFront_alt*/ ctx[1];
				imagecompareslider.$set(imagecompareslider_changes);

				if (dirty & /*tableContent*/ 32) {
					each_value = ensure_array_like(/*tableContent*/ ctx[5]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$2(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(tbody, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (!current || dirty & /*height*/ 1) set_data(t15, /*height*/ ctx[0]);
				if (!current || dirty & /*imgBack_alt*/ 4) set_data(t17, /*imgBack_alt*/ ctx[2]);
				if (!current || dirty & /*imgFront_alt*/ 2) set_data(t19, /*imgFront_alt*/ ctx[1]);
			},
			i(local) {
				if (current) return;
				transition_in(imagecompareslider.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(imagecompareslider.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div1);
				}

				destroy_component(imagecompareslider);
				destroy_each(each_blocks, detaching);
			}
		};
	}

	function instance$2($$self, $$props, $$invalidate) {
		let { height = "250px", imgFront_alt = "Missing right img", imgBack_alt = "Missing left img", imgFront_src = null, imgBack_src = null } = $$props;

		const tableContent = [
			{
				"id": 0,
				"element": "Slide",
				"feature": "width",
				"value": 3
			},
			{
				"id": 1,
				"element": "",
				"feature": "color",
				"value": "white"
			},
			{
				"id": 2,
				"element": "Overlay",
				"feature": "opacity",
				"value": 1
			},
			{
				"id": 3,
				"element": "Handle",
				"feature": "color",
				"value": "white"
			},
			{
				"id": 4,
				"element": "",
				"feature": "size",
				"value": 20
			},
			{
				"id": 5,
				"element": "",
				"feature": "girth",
				"value": 3
			},
			{
				"id": 6,
				"element": "",
				"feature": "opacity",
				"value": 1
			}
		];

		$$self.$$set = $$props => {
			if ('height' in $$props) $$invalidate(0, height = $$props.height);
			if ('imgFront_alt' in $$props) $$invalidate(1, imgFront_alt = $$props.imgFront_alt);
			if ('imgBack_alt' in $$props) $$invalidate(2, imgBack_alt = $$props.imgBack_alt);
			if ('imgFront_src' in $$props) $$invalidate(3, imgFront_src = $$props.imgFront_src);
			if ('imgBack_src' in $$props) $$invalidate(4, imgBack_src = $$props.imgBack_src);
		};

		return [height, imgFront_alt, imgBack_alt, imgFront_src, imgBack_src, tableContent];
	}

	class Default extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$2, create_fragment$3, safe_not_equal, {
				height: 0,
				imgFront_alt: 1,
				imgBack_alt: 2,
				imgFront_src: 3,
				imgBack_src: 4
			});
		}
	}

	var css_248z$1 = "div[name=slideColor].svelte-v9s4co{height:8px;width:200px;background:linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%));border-radius:20px}";
	styleInject(css_248z$1);

	/* test\section\Custom.svelte generated by Svelte v4.2.8 */

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[18] = list[i].id;
		child_ctx[19] = list[i].element;
		child_ctx[20] = list[i].feature;
		child_ctx[21] = list[i].value;
		return child_ctx;
	}

	// (73:30) 
	function create_if_block_6(ctx) {
		let input;
		let mounted;
		let dispose;

		return {
			c() {
				input = element("input");
				attr(input, "type", "range");
				attr(input, "name", "handleOpacity");
				attr(input, "min", "0");
				attr(input, "max", "1");
				attr(input, "step", "0.01");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				set_input_value(input, /*handleOpacity*/ ctx[9]);

				if (!mounted) {
					dispose = [
						listen(input, "change", /*input_change_input_handler_4*/ ctx[17]),
						listen(input, "input", /*input_change_input_handler_4*/ ctx[17])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*handleOpacity*/ 512) {
					set_input_value(input, /*handleOpacity*/ ctx[9]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (71:30) 
	function create_if_block_5(ctx) {
		let input;
		let mounted;
		let dispose;

		return {
			c() {
				input = element("input");
				attr(input, "type", "range");
				attr(input, "name", "handleGirth");
				attr(input, "min", "0");
				attr(input, "max", "100");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				set_input_value(input, /*handleGirth*/ ctx[8]);

				if (!mounted) {
					dispose = [
						listen(input, "change", /*input_change_input_handler_3*/ ctx[16]),
						listen(input, "input", /*input_change_input_handler_3*/ ctx[16])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*handleGirth*/ 256) {
					set_input_value(input, /*handleGirth*/ ctx[8]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (69:30) 
	function create_if_block_4(ctx) {
		let input;
		let mounted;
		let dispose;

		return {
			c() {
				input = element("input");
				attr(input, "type", "range");
				attr(input, "name", "handleSize");
				attr(input, "min", "0");
				attr(input, "max", "100");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				set_input_value(input, /*handleSize*/ ctx[7]);

				if (!mounted) {
					dispose = [
						listen(input, "change", /*input_change_input_handler_2*/ ctx[15]),
						listen(input, "input", /*input_change_input_handler_2*/ ctx[15])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*handleSize*/ 128) {
					set_input_value(input, /*handleSize*/ ctx[7]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (67:30) 
	function create_if_block_3(ctx) {
		let div;

		return {
			c() {
				div = element("div");
				attr(div, "name", "slideColor");
				attr(div, "role", "slider");
				attr(div, "aria-valuemin", "0");
				attr(div, "aria-valuemax", "360");
				attr(div, "aria-valuenow", /*handleColor*/ ctx[12]);
				attr(div, "tabindex", "0");
				attr(div, "class", "svelte-v9s4co");
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	// (65:30) 
	function create_if_block_2(ctx) {
		let input;
		let mounted;
		let dispose;

		return {
			c() {
				input = element("input");
				attr(input, "type", "range");
				attr(input, "name", "overlayOpacity");
				attr(input, "min", "0");
				attr(input, "max", "1");
				attr(input, "step", "0.01");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				set_input_value(input, /*overlayOpacity*/ ctx[6]);

				if (!mounted) {
					dispose = [
						listen(input, "change", /*input_change_input_handler_1*/ ctx[14]),
						listen(input, "input", /*input_change_input_handler_1*/ ctx[14])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*overlayOpacity*/ 64) {
					set_input_value(input, /*overlayOpacity*/ ctx[6]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (63:30) 
	function create_if_block_1(ctx) {
		let div;

		return {
			c() {
				div = element("div");
				attr(div, "name", "slideColor");
				attr(div, "role", "slider");
				attr(div, "aria-valuemin", "0");
				attr(div, "aria-valuemax", "360");
				attr(div, "aria-valuenow", /*slideColor*/ ctx[11]);
				attr(div, "tabindex", "0");
				attr(div, "class", "svelte-v9s4co");
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	// (61:10) {#if (id == 0)}
	function create_if_block(ctx) {
		let input;
		let mounted;
		let dispose;

		return {
			c() {
				input = element("input");
				attr(input, "type", "range");
				attr(input, "name", "slideWidth");
				attr(input, "min", "0");
				attr(input, "max", "100");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				set_input_value(input, /*slideWidth*/ ctx[5]);

				if (!mounted) {
					dispose = [
						listen(input, "change", /*input_change_input_handler*/ ctx[13]),
						listen(input, "input", /*input_change_input_handler*/ ctx[13])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*slideWidth*/ 32) {
					set_input_value(input, /*slideWidth*/ ctx[5]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (56:6) {#each tableContent as {id,element, feature, value}}
	function create_each_block$1(ctx) {
		let tr;
		let td0;
		let t0_value = /*element*/ ctx[19] + "";
		let t0;
		let t1;
		let td1;
		let t2_value = /*feature*/ ctx[20] + "";
		let t2;
		let t3;
		let td2;
		let t4;
		let td3;
		let t5_value = /*value*/ ctx[21] + "";
		let t5;
		let t6;

		function select_block_type(ctx, dirty) {
			if (/*id*/ ctx[18] == 0) return create_if_block;
			if (/*id*/ ctx[18] == 1) return create_if_block_1;
			if (/*id*/ ctx[18] == 2) return create_if_block_2;
			if (/*id*/ ctx[18] == 3) return create_if_block_3;
			if (/*id*/ ctx[18] == 4) return create_if_block_4;
			if (/*id*/ ctx[18] == 5) return create_if_block_5;
			if (/*id*/ ctx[18] == 6) return create_if_block_6;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type && current_block_type(ctx);

		return {
			c() {
				tr = element("tr");
				td0 = element("td");
				t0 = text(t0_value);
				t1 = space();
				td1 = element("td");
				t2 = text(t2_value);
				t3 = space();
				td2 = element("td");
				if (if_block) if_block.c();
				t4 = space();
				td3 = element("td");
				t5 = text(t5_value);
				t6 = space();
			},
			m(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				append(td0, t0);
				append(tr, t1);
				append(tr, td1);
				append(td1, t2);
				append(tr, t3);
				append(tr, td2);
				if (if_block) if_block.m(td2, null);
				append(tr, t4);
				append(tr, td3);
				append(td3, t5);
				append(tr, t6);
			},
			p(ctx, dirty) {
				if (dirty & /*tableContent*/ 1024 && t0_value !== (t0_value = /*element*/ ctx[19] + "")) set_data(t0, t0_value);
				if (dirty & /*tableContent*/ 1024 && t2_value !== (t2_value = /*feature*/ ctx[20] + "")) set_data(t2, t2_value);

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if (if_block) if_block.d(1);
					if_block = current_block_type && current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(td2, null);
					}
				}

				if (dirty & /*tableContent*/ 1024 && t5_value !== (t5_value = /*value*/ ctx[21] + "")) set_data(t5, t5_value);
			},
			d(detaching) {
				if (detaching) {
					detach(tr);
				}

				if (if_block) {
					if_block.d();
				}
			}
		};
	}

	function create_fragment$2(ctx) {
		let div1;
		let h2;
		let t1;
		let div0;
		let imagecompareslider;
		let t2;
		let h30;
		let t4;
		let table;
		let thead;
		let t11;
		let tbody;
		let t12;
		let h31;
		let t14;
		let pre;
		let t15;
		let code;
		let t16;
		let t17;
		let t18;
		let t19;
		let t20;
		let t21;
		let t22;
		let t23;
		let t24;
		let t25;
		let t26;
		let t27;
		let t28;
		let t29;
		let t30;
		let t31;
		let t32;
		let t33;
		let current;

		imagecompareslider = new ImageCompareSlider({
				props: {
					height: /*height*/ ctx[0],
					backSrc: /*imgBack_src*/ ctx[4],
					backAlt: /*imgBack_alt*/ ctx[2],
					frontSrc: /*imgFront_src*/ ctx[3],
					frontAlt: /*imgFront_alt*/ ctx[1],
					slideWidth: /*slideWidth*/ ctx[5],
					slideColor: /*slideColor*/ ctx[11],
					overlayOpacity: /*overlayOpacity*/ ctx[6],
					handleSize: /*handleSize*/ ctx[7],
					handleGirth: /*handleGirth*/ ctx[8],
					handleOpacity: /*handleOpacity*/ ctx[9]
				}
			});

		let each_value = ensure_array_like(/*tableContent*/ ctx[10]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		return {
			c() {
				div1 = element("div");
				h2 = element("h2");
				h2.textContent = "Custom demo";
				t1 = space();
				div0 = element("div");
				create_component(imagecompareslider.$$.fragment);
				t2 = space();
				h30 = element("h3");
				h30.textContent = "Custom characterics";
				t4 = space();
				table = element("table");
				thead = element("thead");
				thead.innerHTML = `<tr><th></th> <th>Feature</th> <th>Slider</th> <th>Value</th></tr>`;
				t11 = space();
				tbody = element("tbody");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t12 = space();
				h31 = element("h3");
				h31.textContent = "Snippet code";
				t14 = space();
				pre = element("pre");
				t15 = text("    ");
				code = element("code");
				t16 = text("\r\n<script>\r\n  import ImageCompareSlider from '../src/ImageCompareSlider.svelte'\r\n  //border's props\r\n  let slideColor=\"white\", slideWidth=");
				t17 = text(/*slideWidth*/ ctx[5]);
				t18 = text(";\r\n  //overlay's props\r\n  let overlayOpacity=");
				t19 = text(/*overlayOpacity*/ ctx[6]);
				t20 = text(";\r\n  //handle's props\r\n  let handleColor=\"white\",handleSize=");
				t21 = text(/*handleSize*/ ctx[7]);
				t22 = text(",handleGirth=");
				t23 = text(/*handleGirth*/ ctx[8]);
				t24 = text(",handleOpacity=");
				t25 = text(/*handleOpacity*/ ctx[9]);
				t26 = text(";\r\n</script>\r\n<div>\r\n  <ImageCompareSlider  \r\n    height=\"");
				t27 = text(/*height*/ ctx[0]);
				t28 = text("\"\r\n    backSrc=\"path_BackgroundImg\"\r\n    backAlt=\"");
				t29 = text(/*imgBack_alt*/ ctx[2]);
				t30 = text("\"\r\n    frontSrc=\"path_foregroundImg\"\r\n    frontAlt=\"");
				t31 = text(/*imgFront_alt*/ ctx[1]);
				t32 = text("\"\r\n    slideWidth=\"{slideWidth}\"\r\n    slideColor=\"{slideColor}\"\r\n    overlayOpacity=\"{overlayOpacity}\"\r\n    handleSize=\"{handleSize}\"\r\n    handleGirth=\"{handleGirth}\"\r\n    handleOpacity=\"{handleOpacity}\"\r\n  />\r\n</div>\r\n    ");
				t33 = text("\r\n  ");
				attr(div0, "class", "container");
				attr(code, "class", "language-html");
				attr(pre, "class", "snippet");
				attr(div1, "id", "custom-component");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, h2);
				append(div1, t1);
				append(div1, div0);
				mount_component(imagecompareslider, div0, null);
				append(div1, t2);
				append(div1, h30);
				append(div1, t4);
				append(div1, table);
				append(table, thead);
				append(table, t11);
				append(table, tbody);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(tbody, null);
					}
				}

				append(div1, t12);
				append(div1, h31);
				append(div1, t14);
				append(div1, pre);
				append(pre, t15);
				append(pre, code);
				append(code, t16);
				append(code, t17);
				append(code, t18);
				append(code, t19);
				append(code, t20);
				append(code, t21);
				append(code, t22);
				append(code, t23);
				append(code, t24);
				append(code, t25);
				append(code, t26);
				append(code, t27);
				append(code, t28);
				append(code, t29);
				append(code, t30);
				append(code, t31);
				append(code, t32);
				append(pre, t33);
				current = true;
			},
			p(ctx, [dirty]) {
				const imagecompareslider_changes = {};
				if (dirty & /*height*/ 1) imagecompareslider_changes.height = /*height*/ ctx[0];
				if (dirty & /*imgBack_src*/ 16) imagecompareslider_changes.backSrc = /*imgBack_src*/ ctx[4];
				if (dirty & /*imgBack_alt*/ 4) imagecompareslider_changes.backAlt = /*imgBack_alt*/ ctx[2];
				if (dirty & /*imgFront_src*/ 8) imagecompareslider_changes.frontSrc = /*imgFront_src*/ ctx[3];
				if (dirty & /*imgFront_alt*/ 2) imagecompareslider_changes.frontAlt = /*imgFront_alt*/ ctx[1];
				if (dirty & /*slideWidth*/ 32) imagecompareslider_changes.slideWidth = /*slideWidth*/ ctx[5];
				if (dirty & /*overlayOpacity*/ 64) imagecompareslider_changes.overlayOpacity = /*overlayOpacity*/ ctx[6];
				if (dirty & /*handleSize*/ 128) imagecompareslider_changes.handleSize = /*handleSize*/ ctx[7];
				if (dirty & /*handleGirth*/ 256) imagecompareslider_changes.handleGirth = /*handleGirth*/ ctx[8];
				if (dirty & /*handleOpacity*/ 512) imagecompareslider_changes.handleOpacity = /*handleOpacity*/ ctx[9];
				imagecompareslider.$set(imagecompareslider_changes);

				if (dirty & /*tableContent, slideWidth, slideColor, overlayOpacity, handleColor, handleSize, handleGirth, handleOpacity*/ 8160) {
					each_value = ensure_array_like(/*tableContent*/ ctx[10]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(tbody, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (!current || dirty & /*slideWidth*/ 32) set_data(t17, /*slideWidth*/ ctx[5]);
				if (!current || dirty & /*overlayOpacity*/ 64) set_data(t19, /*overlayOpacity*/ ctx[6]);
				if (!current || dirty & /*handleSize*/ 128) set_data(t21, /*handleSize*/ ctx[7]);
				if (!current || dirty & /*handleGirth*/ 256) set_data(t23, /*handleGirth*/ ctx[8]);
				if (!current || dirty & /*handleOpacity*/ 512) set_data(t25, /*handleOpacity*/ ctx[9]);
				if (!current || dirty & /*height*/ 1) set_data(t27, /*height*/ ctx[0]);
				if (!current || dirty & /*imgBack_alt*/ 4) set_data(t29, /*imgBack_alt*/ ctx[2]);
				if (!current || dirty & /*imgFront_alt*/ 2) set_data(t31, /*imgFront_alt*/ ctx[1]);
			},
			i(local) {
				if (current) return;
				transition_in(imagecompareslider.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(imagecompareslider.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div1);
				}

				destroy_component(imagecompareslider);
				destroy_each(each_blocks, detaching);
			}
		};
	}

	function instance$1($$self, $$props, $$invalidate) {
		let tableContent;
		let { height = "250px", imgFront_alt = "Missing right img", imgBack_alt = "Missing left img", imgFront_src = null, imgBack_src = null } = $$props;

		//border's props
		let slideColor, slideWidth = 5;

		//overlay's props
		let overlayOpacity = 1;

		//handle's props
		let handleColor, handleSize = 20, handleGirth = 5, handleOpacity = 1;

		function input_change_input_handler() {
			slideWidth = to_number(this.value);
			$$invalidate(5, slideWidth);
		}

		function input_change_input_handler_1() {
			overlayOpacity = to_number(this.value);
			$$invalidate(6, overlayOpacity);
		}

		function input_change_input_handler_2() {
			handleSize = to_number(this.value);
			$$invalidate(7, handleSize);
		}

		function input_change_input_handler_3() {
			handleGirth = to_number(this.value);
			$$invalidate(8, handleGirth);
		}

		function input_change_input_handler_4() {
			handleOpacity = to_number(this.value);
			$$invalidate(9, handleOpacity);
		}

		$$self.$$set = $$props => {
			if ('height' in $$props) $$invalidate(0, height = $$props.height);
			if ('imgFront_alt' in $$props) $$invalidate(1, imgFront_alt = $$props.imgFront_alt);
			if ('imgBack_alt' in $$props) $$invalidate(2, imgBack_alt = $$props.imgBack_alt);
			if ('imgFront_src' in $$props) $$invalidate(3, imgFront_src = $$props.imgFront_src);
			if ('imgBack_src' in $$props) $$invalidate(4, imgBack_src = $$props.imgBack_src);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*slideWidth, overlayOpacity, handleSize, handleGirth, handleOpacity*/ 992) {
				$$invalidate(10, tableContent = [
					{
						"id": 0,
						"element": "Slide",
						"feature": "width",
						"value": slideWidth
					},
					{
						"id": 1,
						"element": "",
						"feature": "color",
						"value": slideColor
					},
					{
						"id": 2,
						"element": "Overlay",
						"feature": "opacity",
						"value": overlayOpacity
					},
					{
						"id": 3,
						"element": "Handle",
						"feature": "color",
						"value": handleColor
					},
					{
						"id": 4,
						"element": "",
						"feature": "size",
						"value": handleSize
					},
					{
						"id": 5,
						"element": "",
						"feature": "girth",
						"value": handleGirth
					},
					{
						"id": 6,
						"element": "",
						"feature": "opacity",
						"value": handleOpacity
					}
				]);
			}
		};

		return [
			height,
			imgFront_alt,
			imgBack_alt,
			imgFront_src,
			imgBack_src,
			slideWidth,
			overlayOpacity,
			handleSize,
			handleGirth,
			handleOpacity,
			tableContent,
			slideColor,
			handleColor,
			input_change_input_handler,
			input_change_input_handler_1,
			input_change_input_handler_2,
			input_change_input_handler_3,
			input_change_input_handler_4
		];
	}

	class Custom extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$1, create_fragment$2, safe_not_equal, {
				height: 0,
				imgFront_alt: 1,
				imgBack_alt: 2,
				imgFront_src: 3,
				imgBack_src: 4
			});
		}
	}

	/* test\section\SingleImg.svelte generated by Svelte v4.2.8 */

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i].id;
		child_ctx[7] = list[i].element;
		child_ctx[8] = list[i].feature;
		child_ctx[9] = list[i].value;
		return child_ctx;
	}

	// (44:6) {#each tableContent as {id, element, feature, value}}
	function create_each_block(ctx) {
		let tr;
		let td0;
		let t1;
		let td1;
		let t3;
		let td2;
		let t5;

		return {
			c() {
				tr = element("tr");
				td0 = element("td");
				td0.textContent = `${/*element*/ ctx[7]}`;
				t1 = space();
				td1 = element("td");
				td1.textContent = `${/*feature*/ ctx[8]}`;
				t3 = space();
				td2 = element("td");
				td2.textContent = `${/*value*/ ctx[9]}`;
				t5 = space();
			},
			m(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				append(tr, t1);
				append(tr, td1);
				append(tr, t3);
				append(tr, td2);
				append(tr, t5);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(tr);
				}
			}
		};
	}

	function create_fragment$1(ctx) {
		let div1;
		let h30;
		let t1;
		let div0;
		let imagecompareslider;
		let t2;
		let p;
		let t5;
		let h31;
		let t7;
		let table;
		let thead;
		let t12;
		let tbody;
		let t13;
		let h32;
		let t15;
		let pre;
		let t16;
		let code1;
		let t17;
		let t18;
		let t19;
		let t20;
		let t21;
		let t22;
		let t23;
		let t24;
		let t25;
		let t26;
		let current;

		imagecompareslider = new ImageCompareSlider({
				props: {
					height: /*height*/ ctx[0],
					backSrc: /*imgBack_src*/ ctx[4],
					backAlt: /*imgBack_alt*/ ctx[2],
					frontSrc: "",
					frontAlt: /*imgFront_alt*/ ctx[1]
				}
			});

		let each_value = ensure_array_like(/*tableContent*/ ctx[5]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		return {
			c() {
				div1 = element("div");
				h30 = element("h3");
				h30.textContent = "Single image";
				t1 = space();
				div0 = element("div");
				create_component(imagecompareslider.$$.fragment);
				t2 = space();
				p = element("p");
				p.innerHTML = `With <code>frontSrc=&quot;&quot;;</code>`;
				t5 = space();
				h31 = element("h3");
				h31.textContent = "Characterics";
				t7 = space();
				table = element("table");
				thead = element("thead");
				thead.innerHTML = `<tr><th></th> <th>Feature</th> <th>Value</th></tr>`;
				t12 = space();
				tbody = element("tbody");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t13 = space();
				h32 = element("h3");
				h32.textContent = "Snippet code";
				t15 = space();
				pre = element("pre");
				t16 = text("    ");
				code1 = element("code");
				t17 = text("\r\n      <script>\r\n        import ImageCompareSlider from '../src/ImageCompareSlider.svelte'\r\n      </script>\r\n      <div>\r\n        <ImageCompareSlider \r\n          height=\"");
				t18 = text(/*height*/ ctx[0]);
				t19 = text("\"\r\n          backSrc=\"path_BackgroundImg\"\r\n          backAlt=\"");
				t20 = text(/*imgBack_alt*/ ctx[2]);
				t21 = text("\"\r\n          frontSrc=\"");
				t22 = text(/*imgFront_src*/ ctx[3]);
				t23 = text("\"\r\n          frontAlt=\"");
				t24 = text(/*imgFront_alt*/ ctx[1]);
				t25 = text("\" \r\n        />\r\n      </div>\r\n    ");
				t26 = text("\r\n  ");
				attr(div0, "class", "container");
				attr(code1, "class", "language-html");
				attr(pre, "class", "snippet");
				attr(div1, "id", "singleImg-component");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, h30);
				append(div1, t1);
				append(div1, div0);
				mount_component(imagecompareslider, div0, null);
				append(div1, t2);
				append(div1, p);
				append(div1, t5);
				append(div1, h31);
				append(div1, t7);
				append(div1, table);
				append(table, thead);
				append(table, t12);
				append(table, tbody);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(tbody, null);
					}
				}

				append(div1, t13);
				append(div1, h32);
				append(div1, t15);
				append(div1, pre);
				append(pre, t16);
				append(pre, code1);
				append(code1, t17);
				append(code1, t18);
				append(code1, t19);
				append(code1, t20);
				append(code1, t21);
				append(code1, t22);
				append(code1, t23);
				append(code1, t24);
				append(code1, t25);
				append(pre, t26);
				current = true;
			},
			p(ctx, [dirty]) {
				const imagecompareslider_changes = {};
				if (dirty & /*height*/ 1) imagecompareslider_changes.height = /*height*/ ctx[0];
				if (dirty & /*imgBack_src*/ 16) imagecompareslider_changes.backSrc = /*imgBack_src*/ ctx[4];
				if (dirty & /*imgBack_alt*/ 4) imagecompareslider_changes.backAlt = /*imgBack_alt*/ ctx[2];
				if (dirty & /*imgFront_alt*/ 2) imagecompareslider_changes.frontAlt = /*imgFront_alt*/ ctx[1];
				imagecompareslider.$set(imagecompareslider_changes);

				if (dirty & /*tableContent*/ 32) {
					each_value = ensure_array_like(/*tableContent*/ ctx[5]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(tbody, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (!current || dirty & /*height*/ 1) set_data(t18, /*height*/ ctx[0]);
				if (!current || dirty & /*imgBack_alt*/ 4) set_data(t20, /*imgBack_alt*/ ctx[2]);
				if (!current || dirty & /*imgFront_src*/ 8) set_data(t22, /*imgFront_src*/ ctx[3]);
				if (!current || dirty & /*imgFront_alt*/ 2) set_data(t24, /*imgFront_alt*/ ctx[1]);
			},
			i(local) {
				if (current) return;
				transition_in(imagecompareslider.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(imagecompareslider.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div1);
				}

				destroy_component(imagecompareslider);
				destroy_each(each_blocks, detaching);
			}
		};
	}

	function instance($$self, $$props, $$invalidate) {
		let { height = "250px", imgFront_alt = "Missing right img", imgBack_alt = "Missing left img", imgFront_src = null, imgBack_src = null } = $$props;

		const tableContent = [
			{
				"id": 0,
				"element": "Slide",
				"feature": "width",
				"value": "/"
			},
			{
				"id": 1,
				"element": "",
				"feature": "color",
				"value": "/"
			},
			{
				"id": 2,
				"element": "Overlay",
				"feature": "opacity",
				"value": "/"
			},
			{
				"id": 3,
				"element": "Handle",
				"feature": "color",
				"value": "/"
			},
			{
				"id": 4,
				"element": "",
				"feature": "size",
				"value": "/"
			},
			{
				"id": 5,
				"element": "",
				"feature": "girth",
				"value": "/"
			},
			{
				"id": 6,
				"element": "",
				"feature": "opacity",
				"value": "/"
			}
		];

		$$self.$$set = $$props => {
			if ('height' in $$props) $$invalidate(0, height = $$props.height);
			if ('imgFront_alt' in $$props) $$invalidate(1, imgFront_alt = $$props.imgFront_alt);
			if ('imgBack_alt' in $$props) $$invalidate(2, imgBack_alt = $$props.imgBack_alt);
			if ('imgFront_src' in $$props) $$invalidate(3, imgFront_src = $$props.imgFront_src);
			if ('imgBack_src' in $$props) $$invalidate(4, imgBack_src = $$props.imgBack_src);
		};

		return [height, imgFront_alt, imgBack_alt, imgFront_src, imgBack_src, tableContent];
	}

	class SingleImg extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance, create_fragment$1, safe_not_equal, {
				height: 0,
				imgFront_alt: 1,
				imgBack_alt: 2,
				imgFront_src: 3,
				imgBack_src: 4
			});
		}
	}

	var css_248z = ".demo{\r\n  --table-header-background-color:#a6a6a6;\r\n  --table-row-odd-background-color:#c1c1c1;\r\n  --table-row-even-background-color:#dddddd;\r\n}\r\n/**\r\n* Component position\r\n*/\r\n.container{\r\n  display: flex;\r\n  justify-content: center;\r\n}\r\n/**\r\n* Table\r\n*/\r\ntable{\r\n  margin: 1em auto;\r\n}\r\ntd, th {\r\n  width: clamp(0em,15vw,10em);\r\n  padding: 0.5em 1em;\r\n  text-align: left;\r\n  border: 1px solid #dddddd;\r\n}\r\nth {\r\n  background-color: var(--table-header-background-color);\r\n}\r\ntr{\r\n  background-color: var(--table-row-odd-background-color);\r\n  &:nth-child(even) {\r\n    background-color: var(--table-row-even-background-color);\r\n  }\r\n}\r\n/**\r\n* Snippet code\r\n*/\r\n.snippet{\r\n  display:flex;\r\n  justify-content: center;\r\n  height: min-content;\r\n  width: 100%;\r\n}\r\ncode{\r\n  background-color: lightgrey;\r\n  padding: 0 2em;\r\n  border: solid 1px grey;\r\n  white-space:pre-wrap;\r\n}\r\n#demo-image-compare-slider.svelte-rjzj6c{--background-color-header:rgb(57, 57, 57);--background-color-footer:rgb(57, 57, 57);--background-color-column-odd:rgb(100, 100, 100);--shadow-box-primary:#191b1f}\r\nheader.svelte-rjzj6c,footer.svelte-rjzj6c{position:sticky;position:-webkit-sticky;align-content:center;text-align:center;padding:1em;box-shadow:0px 1px 5px var(--shadow-box-primary);z-index:9999}\r\nheader.svelte-rjzj6c{top:0;background-color:var(--background-color-header);min-height:5vh}\r\n#standfirst.svelte-rjzj6c{text-align:center;padding:1em}\r\nmain.svelte-rjzj6c{min-height:calc(100vh - 2*var(--banner-min-height));display:flex;flex-wrap:wrap;justify-content:center;padding:0 1em;&>*{\r\n      flex:1;\r\n      padding: 0 1.5em;\r\n\r\n    };&>*:nth-child(odd){\r\n      background-color: var(--background-color-column-odd);\r\n    };background-color:var(--background-color-main)}\r\nfooter.svelte-rjzj6c{bottom:0;background-color:var(--background-color-footer);min-height:5vh;max-height:10em;padding:0.25em 1em}";
	styleInject(css_248z);

	/* test\Demo.svelte generated by Svelte v4.2.8 */

	function create_fragment(ctx) {
		let link;
		let t0;
		let div4;
		let header;
		let t2;
		let div0;
		let t4;
		let main;
		let div1;
		let default_1;
		let t5;
		let div2;
		let custom;
		let t6;
		let div3;
		let singleimg;
		let t7;
		let footer;
		let current;
		default_1 = new Default({ props: { imgBack_src, imgFront_src } });
		custom = new Custom({ props: { imgBack_src, imgFront_src } });
		singleimg = new SingleImg({ props: { imgBack_src, imgFront_src: "" } });

		return {
			c() {
				link = element("link");
				t0 = space();
				div4 = element("div");
				header = element("header");
				header.innerHTML = `<h1>Image Comparison Slider</h1>`;
				t2 = space();
				div0 = element("div");
				div0.innerHTML = `<p>All the photographies and sketches have been made by Kevin Locksy. Please do not download or copy his work without his permission.</p>`;
				t4 = space();
				main = element("main");
				div1 = element("div");
				create_component(default_1.$$.fragment);
				t5 = space();
				div2 = element("div");
				create_component(custom.$$.fragment);
				t6 = space();
				div3 = element("div");
				create_component(singleimg.$$.fragment);
				t7 = space();
				footer = element("footer");
				footer.innerHTML = `<p>Developed by Kevin Locksy.</p> <p>All the photographies and sketches have been taken or made by Kevin Locksy. Please do not download or copy his work without his permission.</p>`;
				document.title = "Demonstration Svelte Component Image Compare Slider";
				attr(link, "rel", "icon");
				attr(link, "href", "favicon-rounded.logo.png");
				attr(header, "class", "svelte-rjzj6c");
				attr(div0, "id", "standfirst");
				attr(div0, "class", "svelte-rjzj6c");
				attr(div1, "id", "demo-default");
				attr(div1, "class", "demo");
				attr(div2, "id", "demo-custom");
				attr(div2, "class", "demo");
				attr(div3, "id", "demo-single-img");
				attr(div3, "class", "demo");
				attr(main, "class", "svelte-rjzj6c");
				attr(footer, "class", "svelte-rjzj6c");
				attr(div4, "id", "demo-image-compare-slider");
				attr(div4, "class", "svelte-rjzj6c");
			},
			m(target, anchor) {
				append(document.head, link);
				insert(target, t0, anchor);
				insert(target, div4, anchor);
				append(div4, header);
				append(div4, t2);
				append(div4, div0);
				append(div4, t4);
				append(div4, main);
				append(main, div1);
				mount_component(default_1, div1, null);
				append(main, t5);
				append(main, div2);
				mount_component(custom, div2, null);
				append(main, t6);
				append(main, div3);
				mount_component(singleimg, div3, null);
				append(div4, t7);
				append(div4, footer);
				current = true;
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(default_1.$$.fragment, local);
				transition_in(custom.$$.fragment, local);
				transition_in(singleimg.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(default_1.$$.fragment, local);
				transition_out(custom.$$.fragment, local);
				transition_out(singleimg.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(div4);
				}

				detach(link);
				destroy_component(default_1);
				destroy_component(custom);
				destroy_component(singleimg);
			}
		};
	}

	const imgBack_src = "pic-r169.jpg";
	const imgFront_src = "draw-r169.jpg";

	class Demo extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, null, create_fragment, safe_not_equal, {});
		}
	}

	const demo = new Demo({
	  target: document.body,
	});

	return demo;

})();
