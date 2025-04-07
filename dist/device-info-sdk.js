!function () {
    var TPV_TV_YEAR_2017_VALUE = 2
    var userAgent = navigator.userAgent.toLocaleLowerCase();
	var titanUA = userAgent.indexOf("titanos") > -1;
	// List of different platforms User agent
	var AocUA = userAgent.indexOf("aoc") > -1;
	var PhilipsUA = userAgent.indexOf("philips") > -1;
	var TclTbrowserUA = userAgent.indexOf("tcl") > -1 || userAgent.indexOf("tbrowser") > -1;
	var MokaUA = userAgent.indexOf("moka") > -1;
	var SkwUA = userAgent.indexOf("skw") > -1;
	var WhaleUA = userAgent.indexOf("whaletv") > -1;
	var SamsungUA = userAgent.indexOf("tizen") > -1 || userAgent.indexOf("samsung") > -1 || userAgent.indexOf("smarthub") > -1;
	var LgUA = userAgent.indexOf("webos") > -1 || userAgent.indexOf("lg") > -1 || userAgent.indexOf("web0s") > -1 || userAgent.indexOf("netcast") > -1;
	var AndroidUA = userAgent.indexOf("android") > -1 || userAgent.indexOf("andr0id") > -1;
	var MozillaUA = userAgent.indexOf("mozilla") > -1;
	var PrestoUA = userAgent.indexOf("presto") > -1;
	var VestelUA = userAgent.indexOf("vstvb") > -1;
	// List of different platforms User agent
    var CALLBACK_ID = 'callback_' + new Date().getTime()
    window[CALLBACK_ID] = ___callback___
    var _device_info = {
        init: function () {
            if (!this.inited) {
                this.inited = true
                if (this.localStorageSupport() && localStorage.infoData) {
                    window[CALLBACK_ID](JSON.parse(localStorage.infoData));
                } else {
                    var infoData = this.parseCookie()
                    if (infoData.deviceid) {
                        return window[CALLBACK_ID](infoData)
                    }
					
                    (titanUA)?this.createScript('titanos'):this.createScript('whaleos');
                }
            }
        },
        createScript: function (pltForm) {
            var script = document.createElement("script");
			switch(pltForm) {
				case "titanos":
                        var ENV_REGEX = /(dev|stg|acc|cert|qa)\d\d/;
                        var launcherEnv = "app"; // Defaults to production
                        if (window.launcher_env && ENV_REGEX.test(window.launcher_env)) {
                            launcherEnv = window.launcher_env;
                        }
                        script.src = "https://"+launcherEnv+".titanos.tv/potamoi/v1/device_info?callback=" + CALLBACK_ID + "&jwt="+window.jwt;
						break;
				case "whaleos":
						script.src = "https://smarttv.zeasn.tv/homepage_api/device/clientInfo?callback=" + CALLBACK_ID;
						break;
			}    
            script.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(script);
        },
        loadInfoData: function (obj) {
            var flag = true;
            if (obj && !!obj.deviceid) {
                flag = false;
                DeviceInfo.Product.deviceID = unescape(obj.deviceid);
            }

            if (flag) {
                this.checkTclPlugin()
            }
        },
        params: ["country", "deviceid", "mac", "manufacturerid", "devicetypeid", "profileid", "ufversion"],
        fromUserAgent: function (data) {
            
            var whaleAdIDData = getWhaleADID(data);
            whaleAdIDData = unescape(whaleAdIDData) || 'unknown';
            DeviceInfo.Product.WhaleAdID = whaleAdIDData;
			// Detect vendor and brand based on userAgent, product details based on signon cookie starts
			switch (true) {
				case titanUA:
					this.deviceVendorBrand("TPV","Philips");// set vendor and brand
					DeviceInfo.Channel.appStore = "TitanOs";// set app store details
					this.checkWhaleOSCookies(data); // set product details
					break;
				case AocUA:
					this.deviceVendorBrand("AOC","AOC");// set vendor and brand
					this.checkWhaleOSCookies(data); // set product details
					break;
				case PhilipsUA:
					this.deviceVendorBrand("Philips","Philips");// set vendor and brand
					this.checkWhaleOSCookies(data); // set product details
					break;
				case TclTbrowserUA:
					this.deviceVendorBrand("TCL","TCL");// set vendor and brand
					this.checkWhaleOSCookies(data); // set product details
					break;
				case MokaUA:
					this.deviceVendorBrand("MOKA","MOKA");// set vendor and brand
					this.checkWhaleOSCookies(data); // set product details
					break;
				case SkwUA:
					this.deviceVendorBrand("Skyworth","Skyworth");// set vendor and brand
					this.checkWhaleOSCookies(data); // set product details
					break;
				case SamsungUA:
					this.deviceVendorBrand("Samsung","Samsung");
					// this.getSamsungLGDeviceData(data);
					break;
				case LgUA:
					this.deviceVendorBrand("LG Electronics","LG");
					// this.getSamsungLGDeviceData(data);
					break;
				case VestelUA:
					this.deviceVendorBrand("Vestel","");
					this.getVestelDeviceData(userAgent);
					break;
					
			}
			// Detect vendor and brand based on userAgent, product details based on signon cookie ends
						
			// Set operating system and browser engine capabilities
			DeviceInfo.Capability.os = AndroidUA ? "Android" : "Linux";
			DeviceInfo.Capability.browserEngine = MozillaUA ? "Blink" : PrestoUA ? "Presto" : "Unknown";
			
            this.detectStreaming();
			this.checkPlayreadySupport();
			this.checkWidevineSupport();
        },
	deviceVendorBrand : function(vendor,brand){
		DeviceInfo.Channel.vendor = vendor;
		DeviceInfo.Channel.brand = brand;
	},
        checkWhaleOSCookies: function (data) {
            DeviceInfo.Product.firmwareVersion = unescape(data.ufversion) || 'unknown'
            DeviceInfo.Product.country = unescape(data.country) || 'unknown'
            DeviceInfo.Product.mac = decodeURIComponent(unescape(data.mac)) || 'unknown'
            DeviceInfo.Product.year = unescape(data.deviceYear) || 'unknown'
            var profileid = unescape(data.profileid)
            //V8NT691GBLF1P1_V8NT691GBLF1_43
            if (profileid) {
                var profileInfo = profileid.split('_')
                DeviceInfo.Product.firmwareComponentID = unescape(profileInfo[1]) || 'unknown';//V8NT691GBLF1
                var ctn = profileInfo[0].replace('/', ''),
                    digitYear,
                    digitYearVal
                if (("Philips" == DeviceInfo.Channel.brand) && ('unknown' == DeviceInfo.Product.year || 'undefined' == DeviceInfo.Product.year)) {
                    if (!!ctn) {
                        digitYearVal = ctn.slice(-3, -2);
                        digitYearVal = (isNaN(digitYearVal)) ? ctn.slice(-4, -3) : digitYearVal;
                        //digitYear = (digitYearVal - TPV_TV_YEAR_2017_VALUE) || 'unknown'
                        if (digitYearVal == TPV_TV_YEAR_2017_VALUE) {
                            digitYear = 0;
                        } else {
                            digitYear = (digitYearVal - TPV_TV_YEAR_2017_VALUE) || 'unknown'
                        }
                    }

                    var year = (!isNaN(digitYear)) ? (2017 + digitYear) : 'unknown'
                    DeviceInfo.Product.year = year;
                }
                var platform = (profileInfo[1] || 'unknown').replace(/\d+$/, '')

                //DeviceInfo.Product.year = year
                DeviceInfo.Product.platform = platform

            }
        },
        getSamsungDeviceData: function () {
            try {
                // Add the JS file dynamically during page load
                addScript('$WEBAPIS/webapis/webapis.js', webAPIscriptLoadedCallback);
                setTimeout(() => removeScript('$WEBAPIS/webapis/webapis.js'), 3000); // Remove after 5 seconds as an example
            } catch (e) {
                console.log("Unable to load the webapi for samsung: Error " + e);
            }


        },
        getLGDeviceData: function () {
            try {
                // Add the JS file dynamically during page load
                addScript('webOSTV.js', webOSscriptLoadedCallback);
                setTimeout(() => removeScript('webOSTV.js'), 3000); // Remove after 5 seconds as an example
            } catch (e) {
                console.log("Unable to load the webapi for samsung: Error " + e);
            }
        },
        getVestelDeviceData: function (userAgent) {
            var brandName = "Vestel";


            try {
                if (userAgent.indexOf("panasonic") > -1) {
                    brandName = "PANASONIC";
                }
                if (userAgent.indexOf("toshiba") > -1) {
                    brandName = "TOSHIBA";
                }
                if (userAgent.indexOf("gogen") > -1) {
                    brandName = "GOGEN";
                }
                if (userAgent.indexOf("hyundai") > -1) {
                    brandName = "HYUNDAI";
                }
                DeviceInfo.Channel.brand = brandName;

                // below code is used to get the model name of vestel device

                var modelRegex = /model\/vestel-([^ ]+)/;

                // Use the regular expression to extract the model number
                var match = userAgent.match(modelRegex);

                // Check if there is a match and get the model number
                var modelNumber = match ? match[1] : "Not found";

                DeviceInfo.Product.platform = modelNumber.toUpperCase();
            } catch (e) {
                console.log("Unable to data for vestel: Error " + e);
            }
        },
        fromSmartTvApi: function () {
            try {
                if (typeof SmartTvA_API !== "undefined") {
                    console.log("Check STA Object: STA object present");
                    DeviceInfo.Capability.support3d = SmartTvA_API.hasCapability("3DSupport");
                    DeviceInfo.Capability.supportKeyNumeric = SmartTvA_API.hasCapability("Key", "numerickeys"); //,VK_1,VK_2,VK_3,VK_4,VK_5,VK_6,VK_7,VK_8,VK_9
                    DeviceInfo.Capability.supportKeyColor = SmartTvA_API.hasCapability("Key", "colorkeys"); //,VK_BLUE,VK_GREEN,VK_YELLOW
                    DeviceInfo.Capability.supportmultiscreen = SmartTvA_API.hasCapability("Multiscreen", "AllJoyn");
                    //DeviceInfo.Capability.supportMPEG_DASH = SmartTvA_API.hasCapability("DRM", "PlayReady", "DASH");
                    //DeviceInfo.Capability.supportPlayready = SmartTvA_API.hasCapability("DRM", "PlayReady", "DASH");
                    //DeviceInfo.Capability.supportWidevineModular = SmartTvA_API.hasCapability("DRM", "Widevine", "AdaptiveStreaming");
                    DeviceInfo.Capability.multiaudioSupport = SmartTvA_API.hasCapability("Multiaudio");
                    DeviceInfo.Capability.TTMLInbandSupport = SmartTvA_API.hasCapability("TTML", "inband");
                    DeviceInfo.Capability.TTMLOutofbandSupport = SmartTvA_API.hasCapability("TTML", "outofband");
                    DeviceInfo.Capability.supportUHD = SmartTvA_API.hasCapability("UHD");
                    //EXTRA
                    DeviceInfo.Capability.supportFHD = SmartTvA_API.hasCapability("FHD");
                    DeviceInfo.Capability.supportHDR_HDR10 = SmartTvA_API.hasCapability("HDR", "HDR10");
                    DeviceInfo.Capability.supportHDR_DV = SmartTvA_API.hasCapability("HDR", "DV");
                    DeviceInfo.Capability.supportHDR = DeviceInfo.Capability.supportHDR_DV || DeviceInfo.Capability.supportHDR_HDR10 || 'unknown'
                    DeviceInfo.Capability.supportMultiAudio = SmartTvA_API.hasCapability("Multiaudio");
                    DeviceInfo.Capability.supportTTMLInband = SmartTvA_API.hasCapability("TTML", "inband");
                    DeviceInfo.Capability.supportTTMLOutofband = SmartTvA_API.hasCapability("TTML", "outofband");
                } else {
                    console.log("Check STA Object: No STA object present");

                }
            } catch (e) {
                console.log("Check STA Object: Error checking STA object");
            }
        },

        detectStreaming: function () {
            var video = document.createElement('video')
            if (!!video.canPlayType && typeof video.canPlayType === 'function') {
                DeviceInfo.Capability.supportAppleHLS = video.canPlayType('application/vnd.apple.mpegURL') != '' || video.canPlayType('audio/mpegurl') != ''
                DeviceInfo.Capability.supportMSSmoothStreaming = video.canPlayType('application/vnd.ms-sstr+xml') != ''
                DeviceInfo.Capability.supportMSSInitiator = video.canPlayType('application/vnd.ms-playready.initiator+xml') != ''
                DeviceInfo.Capability.supportMPEG_DASH = video.canPlayType('application/dash+xml') != ''
            }
        },


        S4: function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        },
        guid: function () {
            return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4());
        },
        parseCookie: function () {
            var cookies = document.cookie,
                ret = {}
            if (this.localStorageSupport() && localStorage.infoData) {
                var m, keyValueReg = /(?:^|;)\s*(\w+)\=([^;]*)\s*/gm
                while (m = keyValueReg.exec(cookies)) {
                    ret[m[1]] = unescape(m[2])
                }
            }// if condition closing bracket
            return ret
        },
        webSocketSupport: function () {
            return !!(window.WebSocket && window.WebSocket.prototype.send)
        },
        localStorageSupport: function () {
            return !!window.localStorage
        },
          checkWidevineSupport: function () {
			var config = [{
				"initDataTypes": ["cenc"],
				"audioCapabilities": [{
					"contentType": "audio/mp4;codecs=\"mp4a.40.2\""
				}],
				"videoCapabilities": [{
					"contentType": "video/mp4;codecs=\"avc1.42E01E\""
				}]
			}];

			return new Promise((resolve, reject) => {
				try {
					navigator.requestMediaKeySystemAccess("com.widevine.alpha", config)
						.then(function (mediaKeySystemAccess) {
							console.log('Widevine support ok');
							DeviceInfo.Capability.supportWidevineModular = true;
							resolve(true);
						})
						.catch(function (e) {
							console.log('No Widevine support');
							console.log(e);
							DeviceInfo.Capability.supportWidevineModular = false;
							resolve(false);
						});
				} catch (e) {
					console.log('Error during Widevine check');
					console.log(e);
					DeviceInfo.Capability.supportWidevineModular = false;
					reject(e);
				}
			});
	},
				checkPlayreadySupport: function () {
					var config = [{
						"initDataTypes": ["cenc"],
						"audioCapabilities": [{
							"contentType": "audio/mp4;codecs=\"mp4a.40.2\""
						}],
						"videoCapabilities": [{
							"contentType": "video/mp4;codecs=\"avc1.42E01E\""
						}]
					}];
			
					return new Promise((resolve, reject) => {
						try {
							navigator.requestMediaKeySystemAccess("com.microsoft.playready", config)
								.then(function (mediaKeySystemAccess) {
									console.log('playready support ok');
									DeviceInfo.Capability.supportPlayready = true;
									resolve(true);
								})
								.catch(function (e) {
									console.log('no playready support');
									console.log(e);
									DeviceInfo.Capability.supportPlayready = false;
									resolve(false);
								});
						} catch (e) {
							console.log('no playready support');
							console.log(e);
							DeviceInfo.Capability.supportPlayready = false;
							resolve(false);
						}
					});
		},

        drmMethodSupport: function () {
            var self = this;
            var returnString;
            returnString = self.checkOIPFDRMAgentObj();
            //returnString = (returnString == "")?"OIPF Not Supported": "OIPF supported";
            try {

                //Using mediakeys check if there is a support for EME
                var eme = "MediaKeys" in window || "WebKitMediaKeys" in window || "MSMediaKeys" in window;
                returnString = (eme) ? "EME" : returnString;

                return returnString;

            } catch (e) {
                return "error";
            }
        },
        checkOIPFDRMAgentObj: function () {
            var testObject = document.createElement("object");
            testObject.type = "application/oipfdrmagent";
            if (typeof (testObject.sendDRMMessage) == "function") {
                return "OIPF";
            } else {
                return "";
            }
        },
        checkOIPFSupport: function () {
            var testObject = document.createElement("object");
            testObject.type = "application/oipfdrmagent";
            try {
                if (typeof (testObject.sendDRMMessage) == "function") {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return "error";
            }
        },
        checkEMESupport: function () {
            var returnString;
            try {

                //Using mediakeys check if there is a support for EME
                var eme = "MediaKeys" in window || "WebKitMediaKeys" in window || "MSMediaKeys" in window;
                returnString = (eme) ? true : false;

                return returnString;

            } catch (e) {
                return "error";
            }
        },
        checkTclPlugin: function () {
            if (typeof tcl !== 'undefined') {
                DeviceInfo.Product.deviceID = tcl.setting.tvDeviceID;
            } else {
                DeviceInfo.Product.deviceID = "zeasn_" + this.guid();
            }
        }
    }

    var DeviceInfo = {};
    DeviceInfo.Channel = {
        appStore: 'Zeasn',
        vendor: "unknown",
        brand: "unknown"
    };

    DeviceInfo.Product = {
        platform: "unknown",
        year: "unknown",
        deviceID: 'unknown',
        firmwareVersion: 'unknown',
        WhaleAdID: "unknown",
        firmwareComponentID: "unknown"
    };
    DeviceInfo.Capability = {
        os: "unknown",
        browserEngine: "unknown",
        hasStorage: _device_info.localStorageSupport(),
        support3d: "unknown",
        supportUHD: "unknown",
        supportHDR: "unknown",
        supportWebSocket: _device_info.webSocketSupport(),
         supportPlayready: _device_info.checkPlayreadySupport()
				.then(function(supported) {
					console.log("PlayReady supported: ", supported);
				})
				.catch(function(error) {
					console.error("Error checking PlayReady support: ", error);
				}),
        supportWidevineModular: _device_info.checkWidevineSupport()
				.then(function(supported) {
					console.log("Widevine supported: ", supported);
				})
				.catch(function(error) {
					console.error("Error checking Widevine support: ", error);
				}),
        supportWidevineClassic: "unknown",
        supportClearKey: "unknown",
        supportPrimetime: "unknown",
        supportFairplay: "unknown",
        supportAdobeHDS: "unknown",
        supportAppleHLS: "unknown",
        supportMSSmoothStreaming: "unknown",
        supportMSSInitiator: "unknown",
        supportMPEG_DASH: "unknown",
        drmMethod: _device_info.drmMethodSupport(),
        supportOIPF: _device_info.checkOIPFSupport(),
        supportEME: _device_info.checkEMESupport(),
    };

    var isDeviceInfoReady = false
    var readyCallbacks = []
    window['DeviceInfo'] = DeviceInfo
    window['onDeviceInfoReady'] = function (callback) {
        if (typeof callback === 'function') {
            if (isDeviceInfoReady) {
                callback(DeviceInfo)
            } else {
                readyCallbacks.push(callback)
            }
        } !_device_info.inited && _device_info.init()
    }

    function ___callback___(obj) {
        var errMsg = null
        try {
            if (!localStorage.infoData) {
                localStorage.infoData = JSON.stringify(obj)
            }
            var cookies = obj.datas.cookies
            _device_info.loadInfoData(cookies)
            _device_info.fromUserAgent(cookies)
            _device_info.fromSmartTvApi()

            isDeviceInfoReady = true
        } catch (e) {
            errMsg = e.stack || e.message || e.toString()
        }
        // obj is only for test
        invokeReadyCallbacks(errMsg, obj)
    }

    function invokeReadyCallbacks(error, obj) {
        var callback
        while (callback = readyCallbacks.shift()) {
            callback(DeviceInfo, error, obj.datas.cookies)
        }
    }

    /* added the code to get whaleAdID */
    function createGuid() {
        function e(e) {
            var t = (Math.random().toString(16) + "000000000").substr(2, 8);
            return e ? "-" + t.substr(0, 4) + "-" + t.substr(4, 4) : t;
        }
        return e() + e(!0) + e(!0) + e();
    }




    function getWhaleADID(data) {
        var whaleAdIDObj = getWhaleAdIDData();
        if (!whaleAdIDObj) {
            whaleAdID = createGuid();
            setWhaleAdID(whaleAdID);
            return whaleAdID;
        } else {
            return unescape(whaleAdIDObj.whaleAdID);
        }

    }

    function setWhaleAdID(whaleAdID) {
        //window.localStorage.setItem('whaleAdID', escape(whaleAdID));
        //localStorage.infoData['whaleAdID'] = escape(whaleAdID);
        var whaleAdIDObj = { 'whaleAdID': whaleAdID };
        var retrievedObject = localStorage.getItem("infoData");
        var deviceInfoData = JSON.parse(retrievedObject);
        deviceInfoData.datas.whaleAdID = whaleAdIDObj;
        localStorage.setItem("infoData", JSON.stringify(deviceInfoData));
        var result = localStorage.getItem("infoData");
        //if(
        console.log(result);

    }

    function getWhaleAdIDData() {
        //window.localStorage.setItem('whaleAdID', escape(whaleAdID));
        // Retrieve the object from storage to add a new student
        var retrievedObject = localStorage.getItem("infoData");
        var deviceInfoData = JSON.parse(retrievedObject);
        if (deviceInfoData.datas.whaleAdID)
            return deviceInfoData.datas.whaleAdID;
        else return null;
    }

    // Function to add the JS file dynamically
    function addScript(src, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.onload = callback; // Optional: callback when script is loaded
        document.head.appendChild(script);
    }

    // Function to be executed after the webAPI script is loaded
    function webAPIscriptLoadedCallback() {
        // Now you can access objects or functions defined in the loaded script
        console.log('Script loaded. Accessing objects...');
        try {
            // Example: Assuming there is an object named "MyObject" in the loaded script
            if (typeof webapis !== 'undefined') {
                var deviceModel = webapis.productinfo.getRealModel();
                DeviceInfo.Product.platform = deviceModel;
                console.log(" DeviceInfo.Product.platform = " + deviceModel);
            } else {
                console.log('webapis Object not found.');
            }

        } catch (error) {
            console.log(" error code = " + error.code);
        }

    }

    // Function to be executed after the webOS script is loaded
    function webOSscriptLoadedCallback() {
        // Now you can access objects or functions defined in the loaded script
        console.log('Script loaded. Accessing objects...');
        try {
            // Example: Assuming there is an object named "MyObject" in the loaded script
            if (typeof webOS !== 'undefined') {
                webOS.deviceInfo(function (device) {
                    if (device.modelName > -1) {
                        DeviceInfo.Product.platform = device.modelName;
                        console.log(" DeviceInfo.Product.platform = " + device.modelName);
                    }
                });

            } else {
                console.log('webOS Object not found.');
            }

        } catch (error) {
            console.log(" error code = " + error.code);
        }

    }

    // Function to remove the previously added JS file
    function removeScript(src) {
        var scripts = document.head.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src === src) {
                document.head.removeChild(scripts[i]);
                console.log('Script removed:', src);
                return;
            }
        }
        console.log('Script not found:', src);
    }
    
}();