var oBsModal = { oWinList: [], x: 0, y: 0, oDragItem: null };

function ShowModal(sUrl, iWidth, iHeight, oWin) {
	if (oWin + "" == "undefined") oWin = window;
	if (iWidth + "" == "undefined") iWidth = $(window).width() - 100;
	if (iHeight + "" == "undefined") iHeight = $(window).height() - 150;

	oBsModal.oWinList.push(oWin);
	var iIndex = oBsModal.oWinList.length;

	$(document).on('show.bs.modal', '.modal', function (event) {
		var zIndex = 1040 + (10 * $('.modal:visible').length);
		$(this).css('z-index', zIndex);

		setTimeout(function () {
			$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
		}, 0);
	});

	$("#popupContainer" + iIndex).remove();
	$("body").append('<div id="popupContainer' + iIndex + '" class="modal fade" role="dialog">' +
			'<div id="popupDialog' + iIndex + '" class="modal-dialog" style="width: ' + (iWidth + 30) + 'px">' +
				'<div class="modal-content" id="modal-content' + iIndex + '">' +
					'<div id="popupTitleBar' + iIndex + '" class="modal-header" style="cursor: move">' +
						'<button type="button" class="close" data-dismiss="modal">&times;</button>' +
						'<h4 style="pointer-events: none;" id="popupTitle' + iIndex + '" class="modal-title"></h4>' +
					'</div>' +
					'<div class="modal-body">' +
					'<div id="idDiaLoading' + iIndex + '" style="text-align: center;width:100%; height:' + iHeight + 'px; line-height:' + iHeight + 'px;"><i style"vertical-align: middle" class="fa fa-spinner fa-spin fa-5x"></i></div>' +
					'<iframe id="popupFrame' + iIndex + '" name="popupFrame' + iIndex + '" onload="SetPopupTitleBar(this,' + iIndex + ')" src="' + sUrl + '" ' +
						'style="display:none; margin: 0px; position: relative; z-index: 202; width:100%; height:100%;background-color:transparent;" scrolling="auto" frameborder="0" allowtransparency="true" width="100%" height="100%"></iframe>' +
					'</div>' +
				 '</div>' +
			'</div>' +
		'</div>');

	$("#popupContainer" + iIndex).modal();
	$("#popupFrame" + iIndex).css({ height: iHeight });
	$("#popupContainer" + iIndex).on('hidden.bs.modal', function () {
		if (oBsModal.oWinList.length > 0) oBsModal.oWinList.length--;
	})

	DiaMakeDragable($("#modal-content" + iIndex));
}

function HideModal() {
	var iIndex = oBsModal.oWinList.length;
	$("#popupContainer" + iIndex).modal("hide");
}

function GetModalWin() {
	return oBsModal.oWinList[oBsModal.oWinList.length - 1];
}

//private functions =============================

function SetPopupTitleBar(oIframe, iIndex) {
	try {
		$("#popupTitle" + iIndex).html(oIframe.contentWindow.document.title);
	} catch (ex) {
		$("#popupTitle" + iIndex).hide();
	}

	$("#idDiaLoading" + iIndex).hide();
	$("#popupFrame" + iIndex).show();
}

function DiaMakeDragable(oBox) {
	oBox.addClass("Dragable");

	if (navigator.platform == "iPad" || navigator.platform == "iPhone" || /Android/i.test(navigator.userAgent)) {
		oBox[0].ontouchstart = function (e) { DiaTouchStart(oBox, e) };
		oBox[0].ontouchmove = function (e) { DiaTouchMove(oBox, e) };
	} else {
		oBox.on("mousemove", function (e) { DiaDragMove(oBox, e) });
		oBox.on("mouseup", function (e) { DiaDragStop(oBox, e) });
		oBox.on("mousedown", function (e) { DiaDragStart(oBox, e); return false });
	}
}

function DiaTouchStart(o, e) {
	var oPos = $(e.target).position();
	oBsModal.x = e.targetTouches[0].pageX - oPos.left;
	oBsModal.y = e.targetTouches[0].pageY - oPos.top;
}

function DiaDragStart(o, e) {
	if (!e) var e = window.event;

	if (e.target && e.target.nodeName) {
		var sNode = e.target.nodeName;
		if (sNode == "IMG" || sNode == "BUTTON")
			return;
	}

	oBsModal.oDragItem = o;

	if (e.offsetX && e.target) {
		oBsModal.x = e.offsetX;
		oBsModal.y = e.offsetY;
	} else {
		var oPos = o.position();
		oBsModal.x = e.clientX - oPos.left;
		oBsModal.y = e.clientY - oPos.top;
	}

	var oOffset = GetBrowserOffset()
	oBsModal.x += oOffset.x;
	oBsModal.y += oOffset.y;

	if (oBsModal.oDragItem.parent()[0] != document.body) {
		var o = $("#modal-content" + oBsModal.oWinList.length);
		o.css({ "width": o.width(), "height": o.height() });
	}

	if (o.setCapture) {
		o.setCapture();
	} else {
		window.addEventListener("mousemove", DiaDragMove2, true);
		window.addEventListener("mouseup", DiaDragStop2, true);
	}
}

function DiaDragMove2(e) {
	DiaDragMove(oBsModal.oDragItem, e);
}

function DiaDragStop2(e) {
	DiaDragStop(oBsModal.oDragItem, e);
}

function DiaDragMove(o, e) {
	if (oBsModal.oDragItem == null) return;

	if (!e) var e = window.event;
	var x = e.clientX + document.body.scrollLeft - document.body.clientLeft - oBsModal.x;
	var y = e.clientY + document.body.scrollTop - document.body.clientTop - oBsModal.y;
	var yOffset = 30;

	$("#popupDialog" + oBsModal.oWinList.length).css("width", "inherit");

	oBsModal.oDragItem.css({
		position: "absolute",
		left: x,
		top: y - yOffset
	});
}

function DiaTouchMove(o, e) {
	e.preventDefault();

	var oTitleBar = $("#popupFrame" + oBsModal.oWinList.length);
	oTitleBar.css("width", oTitleBar.width());

	o.css({
		position: "absolute",
		left: e.targetTouches[0].pageX - oBsModal.x,
		top:  e.targetTouches[0].pageY - oBsModal.y
	});
}

function DiaDragStop(o, e) {
	if (oBsModal.oDragItem == null) return;

	if (o.releaseCapture) {
		o.releaseCapture();
	} else if (oBsModal.oDragItem) {
		window.removeEventListener("mousemove", DiaDragMove2, true);
		window.removeEventListener("mouseup", DiaDragStop2, true);
	}

	oBsModal.oDragItem = null;
}

function GetBrowserOffset() {
	if (window.pageXOffset != null) {
		return { x: window.pageXOffset, y: window.pageYOffset };
	}

	var doc = window.document;
	if (document.compatMode === "CSS1Compat") {
		return {
			x: doc.documentElement.scrollLeft,
			y: doc.documentElement.scrollTop
		};
	}

	return {
		x: doc.body.scrollLeft,
		y: doc.body.scrollTop
	};
}
