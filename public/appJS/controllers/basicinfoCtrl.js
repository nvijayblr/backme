'use strict';
backMe.controller('basicinfoCtrl', ['$scope', 'BaseServices', '$timeout', 'Upload', 'appConstant', '$state', '$q', '$window', function(_scope, _services, _timeout, _http, _appConstant, _state, _q, _window){
	_scope.step = 1;
	_scope.stepsTitle = "Enter Basic Project Information:";
	_scope.posterImg = null;
	_scope.posterOriginalImg = '';
	_scope.myCroppedImage='';
	_scope.projectId = _state.params.projectId;
  
	_scope.startProjectDetails = function(isValidForm) {
		if(!isValidForm) {
			angular.element('md-input-container .ng-invalid').first().focus();
			return;
		}
		if(_scope.project.location.display) {
			_scope.project.location = _scope.project.location.display;
		}
		
		if(!_scope.loggedIn && !_appConstant.currentUser.userId) {
			_scope.showSignUp('basicInfo');
			return;
		}
		if(!_scope.project.email) {
			_scope.project.email = _appConstant.currentUser.email;
			//_scope.project.name = _appConstant.currentUser.name;
			_scope.project.userPhoto = _appConstant.currentUser.profilePicture;
		}
		console.log(_scope.project);
		if(!_scope.project.userId) {
		  _scope.project.userId = _appConstant.currentUser.userId;
		}
		_scope.data = _scope.project;
		
		if(_scope.myCroppedImage) {
			_scope.posterImg = _http.dataUrltoBlob(_scope.myCroppedImage, _scope.posterOriginalImg.name);
		} else {
			_scope.posterImg = {};
		}
		
		if(!_scope.project.coverImage && !_scope.myCroppedImage) {
			_services.toast.show('Please select poster image.');
			return;
		}

		if(_scope.project.stepsCompleted < _scope.step) {
			_scope.project.stepsCompleted = _scope.step;
		}
		_scope.data.posterImg = _scope.posterImg;
		console.log(_scope.posterImg);
		_scope.method = 'POST'; //update project
		if(_scope.projectId == 'new')
		  _scope.method = 'PUT'; //create project
		
		if(!_scope.project.location || !_scope.project.category || !_scope.project.description || !_scope.project.about || !_scope.project.title) {
		_services.toast.show('Project Title/Location/Category/About should not be blank.');
		return;
		}
		_scope.addRewardsSpendFields(_scope.projectId);
		_http.upload({
			method: _scope.method,
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function(data) {
		  if(_scope.method == 'POST') {
			 _services.toast.showProject('Project details upated successfully !!');
			 _scope.project.coverImage = data.data.coverImage;
		  } else {
			  _scope.projectId = data.data.insertId;
			  _scope.project.projectId = _scope.projectId;
			  _scope.project.coverImage = data.data.coverImage;
			  _services.toast.showProject('Project saved in draft successfully !!');
			  _scope.posterImg = undefined;
		  }
		  _state.go('create.projectdetails', { 'projectId': _scope.projectId});
		}, function(err) {
		  console.log(err);
		  _services.toast.show(err.data);
		}, function(evt) {

		});
	}
	
	_scope.upload = function(croppedDataUrl, name, posterImg) {
		//console.log(croppedDataUrl, name, posterImg);
		_scope.posterImg = _http.dataUrltoBlob(croppedDataUrl, name);
		console.log(_http.dataUrltoBlob(_scope.posterImg))
	}
	
	/*Autocomplete - City related functions*/
	_scope.loadAll = function() {
		var allStates = 'Abohar, Achalpur, Adilabad, Adityapur, Adoni, Agar, Agartala, Agra, Ahmadabad, Ahmadnagar, Ahmedabad, Ahmednagar, Ahwa, Aizawl, Ajitgarh, Ajmer, Akbarpur, Akbarpur(Mati), Akola, Alandur, Alappuzha, Alibag, Aligarh, Alipore, Alipurduar, Alirajpur, Allahabad, Almora, Along, Alwar, Ambala, AmbalaSadar, Ambarnath, Ambassa, Ambattur, Ambikapur, Ambur, Amingaon, Ampati, Amravati, Amreli, Amritsar, Amroha, Anand, Anantapur, Anantnag, Angul, Anini, Anuppur, Araria, Ariyalur, Arrah, Arwal, Asansol, AshokNagar, AshoknagarKalyangarh, Asifabad, Auraiya, Aurangabad, Avadi, Azamgarh, Badgam, Badlapur, Bagaha, Bagalkot, Bageshwar, Baghmara, Baghpat, Bahadurgarh, Baharampur, Bahraich, Baidyabati, Baikunthpur, Balaghat, Balangir, Balasore, BaleshwarTown, Ballari, Ballia, Bally, BallyCity, Balod, BalodaBazar, Balrampur, Balurghat, Banda, Bandipore, Bandra (East), Banka, Bankura, Bansberia, Banswara, Barabanki, Baramulla, Baran, Baranagar, Barasat, Baraut, Barddhaman, Bardhaman, Bareilly, Bargarh, Baripada, BaripadaTown, Barmer, Barnala, Barpeta, Barrackpur, Barshi, Barwani, Basirhat, Basti, Batala, Bathinda, Beawar, Beed, Begusarai, Belagavi, Belgaum, Bellary, Belonia, Bemetara, Bengaluru, Bettiah, Betul, Bhabua, Bhadrak, Bhadravati, Bhadreswar, Bhagalpur, BhalswaJahangirPur, Bhandara, Bharatpur, Bharuch, Bhatpara, Bhavnagar, Bhawanipatna, BhilaiNagar, Bhilwara, Bhimavaram, Bhind, Bhiwadi, Bhiwandi, Bhiwani, Bhongiri, Bhopal, BhubaneswarTown, Bhuj, Bhupalpalle, Bhusawal, Bid, Bidar, BidhanNagar, BiharSharif, Bijapur, Bijnor, Bikaner, Bilaspur, Bishnupur, Bishramganj, BishwanathChariali, Bokaro, BokaroSteelCity, Bomdila, Bongaigaon, Bongaon, Botad, Boudh, BrahmapurTown, Budaun, Bulandshahr, Buldhana, Bundi, Burari, Burhanpur, Buxar, CarNicobar, Chaibasa, Chamarajanagar, Chamba, Champawat, Champdani, Champhai, Chandannagar, Chandauli, Chandausi, Chandel, Chandigarh, Chandrapur, Changlang, Chapra, CharkhiDadri, Chas, Chatra, Chennai, Chennai (Madras), Chhapra, Chhatarpur, Chhatrapur, Chhattarpur, Chhindwara, ChhotaUdaipur, Chikkaballapur, Chikmagalur, Chilakaluripet, Chinsurah, Chitradurga, Chitrakoot, Chittaurgarh, Chittoor, Chittorgarh, Churachandpur, Churu, Coimbatore, ConnaughtPlace, CoochBehar, Cuddalore, Cuttack, Dabgram, Dahod, DalloPura, Daltonganj, Daman, Damoh, Dantewada, Daporijo, Darbhanga, Darjeeling, Darjiling, Daryaganj, Datia, Dausa, Davanagere, Davangere, Debagarh, Deesa, DefenceColony, Dehradun, Dehri, Delhi, DelhiCantonment, Deoghar, Deoli, Deoria, Dewas, Dhamtari, Dhanbad, Dhar, Dharamshala, Dharmanagar, Dharmapuri, Dharmavaram, Dharwad, Dhaulpur, Dhemaji, Dhenkanal, Dholpur, Dhubri, Dhule, Dibrugarh, Dimapur, DinapurNizamat, Dindigul, Dindori, Diphu, Diu, Doda, DumDum, Dumka, Dungarpur, Durg, Durgapur, Eluru, EnglishBazar, Erode, Etah, Etawah, Faizabad, Faridabad, Faridkot, Farrukhabad-cum-Fatehgarh, Fatehabad, Fatehgarh, FatehgarhSahib, Fatehpur, Fazilka, Firozabad, Firozpur, Gadag-Betageri, Gadag-Betigeri, Gadchiroli, Gadwal, Ganderbal, Gandhidham, Gandhinagar, Ganganagar, GangapurCity, Gangawati, Gangtok, Garamur, Garhwa, Gariaband, Gauriganj, Gaya, Geyzing, Ghaziabad, Ghazipur, Giridih, Goalpara, Godda, Godhra, GokalPur, Golaghat, Gonda, Gondal, Gondia, Gondiya, Gopalganj, Gopeshwar, Gorakhpur, GreaterHyderabad, GreaterMumbai, GreaterNoida, Gudivada, Gulbarga, Gumla, Guna, Guntakal, Guntur, Gurdaspur, Gurgaon, Guwahati, Gwalior, Gyanpur, Habra, Haflong, Hailakandi, Hajipur, Haldia, Haldwani-cum-Kathgodam, Halisahar, Hamirpur, Hamren, Hanumangarh, Haora, Hapur, Harda, Hardoi, Hardwar, Haridwar, Hassan, Hastsal, Hathras, Hatsingimari, Haveri, Hawai, Hazaribag, Himatnagar, Hindaun, Hindupur, Hinganghat, Hingoli, Hisar, Hissar, Hojai, Hoshangabad, Hoshiarpur, Hospet, Hosur, Howrah, Hubli-Dharwad, Hugli-Chinsurah, Hyderabad, Ichalkaranji, Imphal, Indore, Jabalpur, Jagadhri, Jagatsinghpur, Jagdalpur, Jagtial, Jaipur, Jaisalmer, Jalandhar, Jalgaon, Jalna, Jalore, Jalpaiguri, Jamalpur, Jamin, Jammu, Jamnagar, Jamshedpur, Jamtara, Jamui, Jamuria, Jangaon, JashpurNagar, Jaunpur, Jehanabad, JetpurNavagadh, Jhabua, Jhajjar, Jhalawar, Jhansi, Jhargram, Jharsuguda, Jhunjhunu, Jhunjhunun, Jind, Jodhpur, Jorhat, Jowai, Junagadh, Kadapa, Kailashahar, Kaithal, Kajalgaon, Kakinada, Kakkanad, Kalaburagi, Kalimpong, Kalol, Kalpetta, Kalyani, Kamareddy, Kamarhati, Kancheepuram, Kanchipuram, Kanchrapara, Kanjhawala, Kanker, Kannauj, Kannur, Kanpur, KanpurCity, Kapurthala, Karaikal, Karaikkudi, Karauli, KarawalNagar, Kargil, Karimganj, Karimnagar, Karnal, Karur, Karwar, Kasaragod, Kasganj, Kashipur, Kathua, Katihar, Katni, Kavaratti, Kawardha, Kendrapara, Kendujhar, Keylong, Khagaria, Khalilabad, Khambhalia, Khammam, Khandwa, Khanna, Kharagpur, Khardaha, Khargone, Khleihriat, Khonsa, Khora, Khordha, Khowai, Khunti, Khurja, Kiphire, KirariSulemanNagar, Kishanganj, Kishangarh, Kishtwar, Kochi, Koderma, Kohima, Kokrajhar, Kolar, Kolasib, Kolhapur, Kolkata, Kollam, Koloriang, Kondagaon, Koppal, Koraput, Korba, Kota, Kothagudem, Kottayam, Kozhikode, Krishnagiri, Krishnanagar, Kulgam, Kullu, Kulti, Kumbakonam, Kupwara, Kurichi, Kurnool, Kurukshetra, Lakhimpur, Lakhisarai, Lalitpur, Lamphelpat, Latehar, Latur, Lawngtlai, Leh, Lohardaga, Longding, Longleng, Loni, Lucknow, Ludhiana, Lunavada, Lunglei, Machilipatnam, Madanapalle, Madavaram, Madhepura, Madhubani, Madhyamgram, Madikeri, Madurai, Mahabubabad, Maharajganj, Mahasamund, Mahbubnagar, Mahé, Mahesana, Maheshtala, Mahoba, Mainpuri, Malappuram, Malegaon, Malerkotla, Malkajgiri, Malkangiri, Mamit, Mancherial, Mandi, Mandla, Mandoli, Mandsaur, Mandya, Mangaldoi, Mangalore, Mangaluru, Mangan, Mango, Manjhanpur, Mansa, Margao, Marigaon, Mathura, Mau, MaunathBhanjan, Mawkyrwat, Mayabunder, Medak, Medinipur, Meerut, Mehsana, Midnapore, MiraBhayander, Miryalaguda, Mirzapur, Mirzapur-cum-Vindhyachal, Modasa, Modinagar, Moga, Mokokchung, Mon, Moradabad, Morbi, Morena, Morvi, Motihari, Mughalsarai, Muktsar, Mungeli, Munger, Murwara, Mushalpur, Mustafabad, Muzaffarnagar, Muzaffarpur, Mysore, Mysuru, Nabadwip, Nabarangpur, Nadiad, Nagaon, Nagapattinam, Nagarkurnool, Nagaur, Nagda, Nagercoil, Nagpur, Nahan, Naihati, NailaJanjgir, Nainital, Nalbari, Nalgonda, Namakkal, Namchi, Namsai, Nanded, NandedWaghala, Nandurbar, Nandyal, NangloiJat, Narasaraopet, Narayanpur, Narnaul, Narsinghpur, Nashik, Navgarh, NaviMumbai, NaviMumbaiPanvelRaigarh, Navsari, Nawada, Nawanshahr, Nayagarh, Neemuch, Nellore, NewDelhi, NewTehri, Neyveli, Nirmal, Nizamabad, Noida, Nongpoh, Nongstoin, NorthBarrackpur, NorthDumDum, NorthLakhimpur, Nuapada, Nuh, Ongole, Orai, Oros, Osmanabad, Ozhukarai, Padrauna, Painavu, Pakur, Palakkad, Palanpur, Palghar, Pali, Pallavaram, Palwal, Panaji, Panchkula, Pangin, Panihati, Panikoili, Panipat, Panna, Panvel, Paralakhemundi, Parbhani, Pasighat, Patan, Pathanamthitta, Pathankot, Patiala, Patna, Pauri, Peddapalle, Perambalur, Peren, Phek, Phulbani, Pilibhit, PimpriChinchwad, Pithampur, Pithoragarh, Pondicherry, Poonch, Porbandar, Porompat, PortBlair, Pratapgarh, PreetVihar, Proddatur, Puducherry, Pudukkottai, Pulwama, Pune, Puri, Purnia, Purulia, Puruliya, RaeBareli, Raichur, Raiganj, Raigarh, Raipur, Raisen, Rajahmundry, Rajapalayam, RajarhatGopalpur, Rajgarh, Rajkot, Rajnandgaon, Rajouri, RajouriGarden, Rajpipla, RajpurSonarpur, Rajsamand, Ramagundam, Ramanagara, Ramanathapuram, Ramban, Ramgarh, Rampur, Ranchi, Ranibennur, Raniganj, Ratlam, Ratnagiri, RaurkelaIndustrialTownship, RaurkelaTown, Rayagada, Reasi, ReckongPeo, Resubelpara, Rewa, Rewari, Rishra, Robertsganj, RobertsonPet, Rohtak, Roorkee, Rudraprayag, Rudrapur, Rupnagar, S.A.S.Nagar, SadarBazaar, Sagar, Saharanpur, Saharsa, Sahebganj, Saiha, Saket, Salem, Samastipur, Samba, Sambalpur, Sambhal, Sangareddy, Sangli, SangliMirajKupwad, Sangrur, Santipur, Sasaram, Satara, Satna, SawaiMadhopur, Secunderabad, Sehore, Senapati, Seoni, Seppa, Seraikela, Serampore, Serchhip, Shahdara, Shahdol, Shahjahanpur, Shajapur, Shamli, Sheikhpura, Sheohar, Sheopur, Shikohabad, Shillong, Shimla, Shimoga, Shivamogga, Shivpuri, Shravasti, Shupiyan, Sibsagar, Siddipet, Sidhi, Sikar, Silchar, Siliguri, Silvassa, Simdega, Singrauli, Sircilla, Sirohi, Sirsa, Sitamarhi, Sitapur, Sivaganga, Siwan, Solan, Solapur, Sonari, Sonipat, SouthDumDum, SriMuktsarSahib, Srikakulam, Srinagar, Subarnapur, Sujangarh, Sukma, SultanPurMajra, Sultanpur, Sundargarh, Supaul, Surajpur, Surat, Surendranagar, SurendranagarDudhrej, Suri, Suryapet, Tadepalligudem, Tadpatri, Tambaram, Tamenglong, Tamluk, TarnTaranSahib, TawangTown, Tenali, Tezpur, Tezu, Thane, Thanesar, Thanjavur, Theni, Thiruvananthapuram, Thoothukkudi, Thoothukudi (Tuticorin), Thoubal, Thrissur, Tikamgarh, Tinsukia, Tiruchirappalli, Tirunelveli, Tirupati, Tiruppur, Tirupur, Tiruvallur, Tiruvannaamalai, Tiruvannamalai, Tiruvarur, Tiruvottiyur, Titagarh, Tonk, Tuensang, Tumakuru, Tumkur, Tura, Udagamandalam(Ootacamund/Ooty), Udaipur, Udaipur,Tripura, Udalguri, Udgir, Udhampur, Udupi, Ujjain, Ukhrul, Ulhasnagar, Uluberia, Umaria, Una, Unnao, Uttarkashi, UttarparaKotrung, Vadodara, Valsad, Varanasi, VasaiVirarCity, VasantVihar, Vellore, Veraval, Vidisha, Vijayapura, Vijayawada, Vikarabad, Viluppuram, Virudhunagar, Visakhapatnam, Vizianagaram, Vyara, Waidhan, Wanaparthy, Warangal, Wardha, Washim, Williamnagar, Wokha, Yadgir, YamunaNagar, Yanam, Yavatmal, Yingkiong, Yupia, Ziro, Zunheboto';
		return allStates.split(/, +/g).map( function (state) {
			return {
				value: state.toLowerCase(),
				display: state
			};
		});
    }

    _scope.createFilterFor = function(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(state) {
			return (state.value.indexOf(lowercaseQuery) === 0);
		};
    }

	_scope.querySearch = function (query) {
		var results = query ? _scope.states.filter(_scope.createFilterFor(query) ) : _scope.states;
		var deferred = _q.defer();
		_timeout(function () { 
			deferred.resolve( results ); 
		},0);
		return deferred.promise;
    }

	_scope.states = _scope.loadAll();
    _scope.searchText = null;

}]);
