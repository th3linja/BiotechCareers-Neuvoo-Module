
var k = '';
var l = '';

async function getLocationData(){
	jQuery.ajax({
		dataType: "json",
		url: 'https://api.ipify.org?format=jsonp&callback=?',
		async: false,
		success: function(data){
			var ip = data.ip;
			console.log(ip)
			jQuery.ajax({
				dataType: "json",
				url: 'https://ipapi.co/'+(ip)+'/json',
				async: false,
				success: function(myData){
					console.log(myData.city);
					l = myData.city;
					return l;
				}
			})
		}
	})
}


document.addEventListener("DOMContentLoaded", async function(event) { 
	document.getElementById("block-system-main").innerHTML =
		"<div id=\"search-container\">\
			<form id=\"neuvoo-form\" method=\"get\" onsubmit=\"return false\">\
				<input autocomplete=\"off\" id=\"k-value\" name=\"k\" value placeholder=\"keywords,company,skills...\" tabindex=\"1\">\
				<input autocomplete=\"off\" id=\"l-value\" name=\"l\" value placeholder=\"city, region, country...\" tabindex=\"1\">\
				<input id=\"neuvoo-search-button\" type=\"button\" onclick=\"search(this.form)\" value=\"Find Jobs\">\
			</form>\
		</div>\
		<br>\
		<div id=\"job-list\">\
		</div>"

	k = window.location.href.split('q=')[1]
	if (k == null){
		k = '';
	} else {
		getLocationData();
		while (!l){
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		k = k.replaceAll("+", " ");
		document.getElementById("k-value").value = k;
		document.getElementById("l-value").value = l;
		document.getElementById("neuvoo-search-button").click();
	}
});

function search(form){
	document.getElementById("job-list").innerHTML = "";
	var links = getLink(form);
	for (i = 0; i<links.length; i++){
		getNeuvoo(links[i]);
	}
}

function getLink(form){
	try{
		var keywords = form.k.value.replace(/\s/, "+").split(",");
		var locations = form.l.value.replace(/\s/, "+").split(",");
		var links = [];
		for (i = 0; i < locations.length; i++){
			for (j = 0; j < keywords.length; j++){
				var link = "https://neuvoo.com/services/api-new/search?ip=1.1.1.1&useragent=123asd&k=" + keywords[j]
							+ "&l=" + locations[i] + "&country=US&limit=30&format=xml&publisher=c25a4d02&subid=10101&radius=75";
				links.push([link, keywords[j], locations[i]]);
			}
		}
	} catch(err){
		document.getElementById("job-list").innerHTML = err.message;
	}
	
	return links;
}

function getNeuvoo(link){
	if (link[1] == "" || link[2] == ""){
		console.log("Parameters are empty.")
		return;
	}

	try{
		var connect = new XMLHttpRequest();
		connect.open("GET", link[0], true);
		connect.onload = function () {
		    if (connect.readyState === connect.DONE && connect.status === 200) {
		        var xmldoc = connect.responseXML;
				console.log(xmldoc);
				//document.getElementById("job-list").innerHTML += link[1] + " in " + link[2];
				parseNuvooXML(xmldoc);
			}
		};
		connect.send();
	} catch(e){
		console.error(e);
	}
	
}

function parseNuvooXML(xmlDoc){
	var txt = "";
	var totalresults = xmlDoc.getElementsByTagName("totalresults")[0].childNodes[0].nodeValue;
    //document.getElementById("job-list").innerHTML += "Total Results: " + totalresults;

    var result = xmlDoc.documentElement.childNodes;
    
	for (i = 1; i < result.length; i++){
		for (j = 0; j < result[i].childNodes.length; j++){
			var location = ""
			var url = ""
			txt += "<div class=\"neuvoo_job_container\"><div class=\"neuvoo_job_card\">";
			for (k = 0; k < result[i].childNodes[j].childNodes.length; k++){
				try{
					if (result[i].childNodes[j].childNodes[k].nodeName != null && typeof(result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue) !== 'undefined'){
						switch(result[i].childNodes[j].childNodes[k].nodeName){
								case 'jobtitle':
									txt += "<div class=\"neuvoo_jobtitle\">" + result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue + "</div>";
									break;
								case 'company':
									txt += "<div class=\"neuvoo_job_company\">" + result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue + "</div>";
									break;
								case 'city':
									location += "<div class=\"neuvoo_job_location\">" + result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue + ", ";
									break;
								case 'state':
									location += result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue + "</div>";
									txt += location;
									break;
								//case 'country':
								//	txt += "<div class=\"country\">" + result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue + "</div>";
								//	break;
								case 'date':
									txt += "<div class=\"neuvoo_job_date\">" + result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue + "</div>";
									break;
								case 'description':
									txt += "<div class=\"neuvoo_job_description\">" + result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue + "</div>";
									break;
								case 'url':
									url += "<a href=\"" + result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue ;
									break;
								//case 'logo':
								//	txt += "<img src=\"" + result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue + "\">"
								//	break;
								case 'onmousedown':
									var jsa = result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue;
									jsa = jsa.substring(jsa.indexOf("\'"), jsa.indexOf(";"));
									jsa = jsa.replaceAll(/'/g, "");
									url += jsa + "\">" + "Click to learn more..." + "</a>";
									txt += url;
									break;
						}
					
					}else {
						console.log(typeof(result[i].childNodes[j].childNodes[k].childNodes[0].nodeValue));
					}
				} catch (e){
					console.log(e.message);
				}
			}
			txt += "</div></div>";
    	}
    }

    document.getElementById("job-list").innerHTML += txt;
}

