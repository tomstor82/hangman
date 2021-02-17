var ajaxreq = false, ajaxCallback;

// Ajax request

function ajaxRequest(filename) {
	try {
		// Modern browsers
		ajaxreq = new XMLHttpRequest();
	}
	catch (error) {
		try {
			// IE 5 or 6
			ajaxreq = newActiveXObject("Microsoft-XMLHTTP");
		}
		catch (error) {
			return false;
		}
	}
	ajaxreq.open("GET", filename);
	ajaxreq.onreadystatechange = ajaxResponse;
	ajaxreq.send(null);
}

// Ajax response

function ajaxResponse() {
	if (ajaxreq.readyState != 4) return;
	if (ajaxreq.status === 200) {
		// if the request succeeded and data exist in "ajaxCallback"
		if (ajaxCallback) ajaxCallback();
		else alert("Request failed: " + ajaxreq.statusText);
	return true;
	}
}
