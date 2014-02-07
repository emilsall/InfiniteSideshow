var SideSlide = function (settings) {
	var $parent = $('.endless'),
		$org = $('.original'),
		$clone = $org.clone().removeClass('original').addClass('clone'),
		width = $org.outerWidth(),
		direction = 'x',
		lastX = 0,
		progress = 0,
		dragDist = 0,
		dragging = false;


	$clone.insertAfter($org);
	if (width < window.innerWidth) {
		// needs a second clone to fill width
		$clone.clone().insertAfter($org);
	} 
	$parent.wrapInner('<div class="scroller" />');

	var $scroller = $parent.children().first();

	var getPosition = function (event) {
		if(event.touches){
			// android
			return {
				x : event.touches[0].pageX,
				y : event.touches[0].pageY
			};
		} else {
			if(event.pageX !== undefined){
				// modern browser
				return {
					x : event.pageX,
					y : event.pageY
				};
			} else {
				// oldie
				return {
					x : event.clientX,
					y : event.clientY
				};
			}
		}
	};

	var update = function (x) {
		x = (x + width) % width;
		if (x < 0) x = x + width;

		$scroller.css('transform', 'translateX(' + -x + 'px)');

	};

	var startDrag = function (e) {
		e.preventDefault();
		dragging = true;
		startDrag = getPosition(e)[direction];
		killInertia = true;
		diff = 0;
	};

	var whileDrag = function (e) {
		if (!dragging) return;
		e.preventDefault();
		
		// check values
		dragDist = getPosition(e)[direction] - startDrag;
		diff = lastX - getPosition(e)[direction];
		lastX = getPosition(e)[direction];
		
		// update scene
		if (diff !== 0) update(progress - dragDist);
	};

	var stopDrag = function (e) {
		if (dragging) {
			progress = progress - dragDist;
			dragging = false;
			
			// inertia?
			if (Math.abs(diff) > 4) inertia();
		}
	};

	var inertia = function (target, speed) {
		// calculate target based on last move diff?
		if (typeof target == 'undefined') target = progress + (diff * 10);
		speed = speed || 8;
		killInertia = false;
		inertiaRunning = true;
		
		var calc = function () {
			var step = Math.round((target - progress) / speed);
			if (!killInertia && step && progress != target) {
				progress += step;
				requestAnimationFrame(calc);
			}
			update(progress);
		};
		calc();
	};

	var step = function (dir) {
		var stepSize = settings.stepSize || window.innerWidth;
		killInertia = true;

		requestAnimationFrame(function(){
			inertia(progress + (dir == 'left' ? - stepSize : stepSize));
		});
	};


	// drag handlers
	$parent[0].addEventListener('mousedown', startDrag);
	$parent[0].addEventListener('touchstart', startDrag);

	document.addEventListener('mousemove', whileDrag);
	document.addEventListener('touchmove', whileDrag);

	document.addEventListener('mouseup', stopDrag);
	document.addEventListener('touchend', stopDrag);

	return {
		step: step
	};

};
