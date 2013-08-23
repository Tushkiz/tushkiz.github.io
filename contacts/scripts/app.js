(function () {
	var contacts = [
		{ name: "Tushar", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "tusharlsonawane@gmail.com", type: "family" },
    { name: "Shridhar", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "shridhar.deshmukh3@gmail.com", type: "college" },
    { name: "Pratik", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "pratik@me.com", type: "school" },
    { name: "Onkar", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "onkar@me.com", type: "college" },
    { name: "Rahul", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "rahul@me.com", type: "college" }
	];

	/***  Model  ***/

	var Contact = Backbone.Model.extend({
		defaults: {
			name: "",
			address: "not assigned",
			tel: "not assigned",
			email: "not assigned",
			type: "",
			photo: "http://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y"
		}
	});

	
	/***  Collection  ***/
	var Directory = Backbone.Collection.extend({
		model: Contact
	});

	/***  View for Contact  ***/
	var ContactView = Backbone.View.extend({
		tagName: 'article',
		className: 'card',
		template: $('#contactCardTemplate').html(),
		editTemplate: _.template($("#contactEditTemplate").html()),

		render: function() {
			var tmpl = _.template(this.template);

			this.model.set({"photo": "http://www.gravatar.com/avatar/" + this.getHash(this.model.get('email')) + "?d=mm&s=100"});

			this.$el.html(tmpl(this.model.toJSON()));
			return this;
		},

		// events
		events: {
            "click a.delete": "deleteContact",
            "click a.edit": "editContact",
            "click a.hide": "hideContact",
            "change select.type": "addType",
            "click button.save": "saveEdits",
            "click button.cancel": "cancelEdit"
        },

    deleteContact: function() {
			var removedType = this.model.get("type").toLowerCase();

			this.model.destroy();

			this.remove();

			if(_.indexOf(directory.getTypes(), removedType) === -1) {
				directory.$el.find(".filter select").children("[value='" + removedType + "']").remove();
			}
		},

		editContact: function () {
		    this.$el.html(this.editTemplate(this.model.toJSON()));
		    $('.modal-overlay').fadeIn("fast", function() {
		    	$('#editContact').slideDown();
		    });
		    var newOpt = $("<option/>", {
		        html: "<em>Add new...</em>",
		        value: "addType"   
		    });
		 	
		 		
		    this.select = directory.createSelect().addClass("type")
		        .val(this.$el.find(".type").val()).append(newOpt)
		        .appendTo(this.$el.find("#typeControl"));
		 
		    this.$el.find("input[type='hidden']").remove();
		},

		hideContact: function() {
			this.$el.find(".info").toggleClass('hidden');
			this.$el.find('.hide').toggleClass('show');
		},

		addType: function() {
			if(this.select.val() === "addType") {
				this.select.remove();

				$("<input />", {
					"class": "type"
				}).	appendTo(this.$el.find("#typeControl")).focus();
			}
		},

		saveEdits: function(e) {
			e.preventDefault();

			var formData = {},
					prev = this.model.previousAttributes();

			//get form data
      $(e.target).closest("form")
      					 .find(":input")
      					 .not("button")
      					 .each(function () {
          					var el = $(this);
          					formData[el.attr("class")] = el.val();
      					});

    	if(formData.name === "") {
    		alert('Please enter a Name');
    		return;
    	}

    	if(formData.email === "") {
    		alert('Please give Email for contact');
    		return;
    	}

    	//update model
      this.model.set(formData);

      //render view
      //this.render();
      this.cancelEdit();

      //if model acquired default photo property, remove it
			if(prev.photo === "http://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y&s=100") {
				delete prev.photo;
			}

			_.each(contacts, function(contact) {
				if(_.isEqual(contact, prev)) {
					contacts.splice(_.indexOf(contacts, contact), 1, formData);
				}
			});
			
		},

		cancelEdit: function() {
			var self = this;
			$('.modal').slideUp(function() {
			  $('.modal-overlay').fadeOut("fast", function() {
			  	self.render();
			  });
			});
		},
		/***  Helper Function for calculating MD5  ***/
		getHash: (function() {
	function md5cycle(x, k) {
	var a = x[0], b = x[1], c = x[2], d = x[3];

	a = ff(a, b, c, d, k[0], 7, -680876936);
	d = ff(d, a, b, c, k[1], 12, -389564586);
	c = ff(c, d, a, b, k[2], 17,  606105819);
	b = ff(b, c, d, a, k[3], 22, -1044525330);
	a = ff(a, b, c, d, k[4], 7, -176418897);
	d = ff(d, a, b, c, k[5], 12,  1200080426);
	c = ff(c, d, a, b, k[6], 17, -1473231341);
	b = ff(b, c, d, a, k[7], 22, -45705983);
	a = ff(a, b, c, d, k[8], 7,  1770035416);
	d = ff(d, a, b, c, k[9], 12, -1958414417);
	c = ff(c, d, a, b, k[10], 17, -42063);
	b = ff(b, c, d, a, k[11], 22, -1990404162);
	a = ff(a, b, c, d, k[12], 7,  1804603682);
	d = ff(d, a, b, c, k[13], 12, -40341101);
	c = ff(c, d, a, b, k[14], 17, -1502002290);
	b = ff(b, c, d, a, k[15], 22,  1236535329);

	a = gg(a, b, c, d, k[1], 5, -165796510);
	d = gg(d, a, b, c, k[6], 9, -1069501632);
	c = gg(c, d, a, b, k[11], 14,  643717713);
	b = gg(b, c, d, a, k[0], 20, -373897302);
	a = gg(a, b, c, d, k[5], 5, -701558691);
	d = gg(d, a, b, c, k[10], 9,  38016083);
	c = gg(c, d, a, b, k[15], 14, -660478335);
	b = gg(b, c, d, a, k[4], 20, -405537848);
	a = gg(a, b, c, d, k[9], 5,  568446438);
	d = gg(d, a, b, c, k[14], 9, -1019803690);
	c = gg(c, d, a, b, k[3], 14, -187363961);
	b = gg(b, c, d, a, k[8], 20,  1163531501);
	a = gg(a, b, c, d, k[13], 5, -1444681467);
	d = gg(d, a, b, c, k[2], 9, -51403784);
	c = gg(c, d, a, b, k[7], 14,  1735328473);
	b = gg(b, c, d, a, k[12], 20, -1926607734);

	a = hh(a, b, c, d, k[5], 4, -378558);
	d = hh(d, a, b, c, k[8], 11, -2022574463);
	c = hh(c, d, a, b, k[11], 16,  1839030562);
	b = hh(b, c, d, a, k[14], 23, -35309556);
	a = hh(a, b, c, d, k[1], 4, -1530992060);
	d = hh(d, a, b, c, k[4], 11,  1272893353);
	c = hh(c, d, a, b, k[7], 16, -155497632);
	b = hh(b, c, d, a, k[10], 23, -1094730640);
	a = hh(a, b, c, d, k[13], 4,  681279174);
	d = hh(d, a, b, c, k[0], 11, -358537222);
	c = hh(c, d, a, b, k[3], 16, -722521979);
	b = hh(b, c, d, a, k[6], 23,  76029189);
	a = hh(a, b, c, d, k[9], 4, -640364487);
	d = hh(d, a, b, c, k[12], 11, -421815835);
	c = hh(c, d, a, b, k[15], 16,  530742520);
	b = hh(b, c, d, a, k[2], 23, -995338651);

	a = ii(a, b, c, d, k[0], 6, -198630844);
	d = ii(d, a, b, c, k[7], 10,  1126891415);
	c = ii(c, d, a, b, k[14], 15, -1416354905);
	b = ii(b, c, d, a, k[5], 21, -57434055);
	a = ii(a, b, c, d, k[12], 6,  1700485571);
	d = ii(d, a, b, c, k[3], 10, -1894986606);
	c = ii(c, d, a, b, k[10], 15, -1051523);
	b = ii(b, c, d, a, k[1], 21, -2054922799);
	a = ii(a, b, c, d, k[8], 6,  1873313359);
	d = ii(d, a, b, c, k[15], 10, -30611744);
	c = ii(c, d, a, b, k[6], 15, -1560198380);
	b = ii(b, c, d, a, k[13], 21,  1309151649);
	a = ii(a, b, c, d, k[4], 6, -145523070);
	d = ii(d, a, b, c, k[11], 10, -1120210379);
	c = ii(c, d, a, b, k[2], 15,  718787259);
	b = ii(b, c, d, a, k[9], 21, -343485551);

	x[0] = add32(a, x[0]);
	x[1] = add32(b, x[1]);
	x[2] = add32(c, x[2]);
	x[3] = add32(d, x[3]);

	}

	function cmn(q, a, b, x, s, t) {
	a = add32(add32(a, q), add32(x, t));
	return add32((a << s) | (a >>> (32 - s)), b);
	}

	function ff(a, b, c, d, x, s, t) {
	return cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}

	function gg(a, b, c, d, x, s, t) {
	return cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}

	function hh(a, b, c, d, x, s, t) {
	return cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function ii(a, b, c, d, x, s, t) {
	return cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	function md51(s) {
	txt = '';
	var n = s.length,
	state = [1732584193, -271733879, -1732584194, 271733878], i;
	for (i=64; i<=s.length; i+=64) {
	md5cycle(state, md5blk(s.substring(i-64, i)));
	}
	s = s.substring(i-64);
	var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
	for (i=0; i<s.length; i++)
	tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
	tail[i>>2] |= 0x80 << ((i%4) << 3);
	if (i > 55) {
	md5cycle(state, tail);
	for (i=0; i<16; i++) tail[i] = 0;
	}
	tail[14] = n*8;
	md5cycle(state, tail);
	return state;
	}

	/* there needs to be support for Unicode here,
	 * unless we pretend that we can redefine the MD-5
	 * algorithm for multi-byte characters (perhaps
	 * by adding every four 16-bit characters and
	 * shortening the sum to 32 bits). Otherwise
	 * I suggest performing MD-5 as if every character
	 * was two bytes--e.g., 0040 0025 = @%--but then
	 * how will an ordinary MD-5 sum be matched?
	 * There is no way to standardize text to something
	 * like UTF-8 before transformation; speed cost is
	 * utterly prohibitive. The JavaScript standard
	 * itself needs to look at this: it should start
	 * providing access to strings as preformed UTF-8
	 * 8-bit unsigned value arrays.
	 */
	function md5blk(s) { /* I figured global was faster.   */
	var md5blks = [], i; /* Andy King said do it this way. */
	for (i=0; i<64; i+=4) {
	md5blks[i>>2] = s.charCodeAt(i)
	+ (s.charCodeAt(i+1) << 8)
	+ (s.charCodeAt(i+2) << 16)
	+ (s.charCodeAt(i+3) << 24);
	}
	return md5blks;
	}

	var hex_chr = '0123456789abcdef'.split('');

	function rhex(n) {
	var s='', j=0;
	for(; j<4; j++)
	s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
	+ hex_chr[(n >> (j * 8)) & 0x0F];
	return s;
	}

	function hex(x) {
	for (var i=0; i<x.length; i++)
	x[i] = rhex(x[i]);
	return x.join('');
	}

	function md5(s) {
	return hex(md51(s));
	}

	/* this function is much faster,
	so if possible we use it. Some IEs
	are the only ones I know of that
	need the idiotic second function,
	generated by an if clause.  */

	function add32(a, b) {
	return (a + b) & 0xFFFFFFFF;
	}

	if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
	function add32(x, y) {
	var lsw = (x & 0xFFFF) + (y & 0xFFFF),
	msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 0xFFFF);
	}
	}

	 return function (str) {
	 	return md5(str);
	 }
	})()
});

	/***------------------------------------------------------------------------------------***/
	/***  View for Directory  ***/
	var DirectoryView = Backbone.View.extend({
		el: $('.contacts-container'),
		editTemplate: _.template($("#contactEditTemplate").html()),

		initialize: function() {
			this.collection = new Directory(contacts);

            this.render();
            this.$el.find(".filter").append(this.createSelect()); 

            this.on("change:filterType", this.filterByType, this);
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.renderContact, this);
            this.collection.on("remove", this.removeContact, this);
		},

		//add ui events
		events: {
		    "change .filter select": "setFilter",
		    "click #add": "addContact",
		    "click #cancel": "showForm",
		    "click #showForm": "showForm"
		},

		render: function() {
			this.$el.find("article").remove();

            _.each(this.collection.models, function (item) {
                this.renderContact(item);
            }, this);
		},

		renderContact: function(item) {
			var contactView = new ContactView({
                model: item
            });

            this.$el.append(contactView.render().el);
		},

		getTypes: function () {
		    return _.uniq(this.collection.pluck("type"), false, function (type) {
		        return type.toLowerCase();
		    });
		},
		 
		createSelect: function () {
		    var filter = this.$el.find(".filter"),
		        select = $("<select/>", {
		            html: "<option>all</option>"
		        });
		 
		    _.each(this.getTypes(), function (item) {
		        var option = $("<option/>", {
		            value: item.toLowerCase(),
		            text: item.toLowerCase()
		        }).appendTo(select);
		    });
		    return select;
		},

		//Set filter property and fire change event
		setFilter: function (e) {
		    this.filterType = e.currentTarget.value;
		    this.trigger("change:filterType");
		},

		filterByType: function () {
		    if (this.filterType === "all") {
		        this.collection.reset(contacts);
		        contactsRouter.navigate("filter/all");
		    } else {
		        this.collection.reset(contacts, { silent: true });

				var filterType = this.filterType,
					filtered = _.filter(this.collection.models, function (item) {
						return item.get("type").toLowerCase() === filterType;
					});
		 
		        this.collection.reset(filtered);
		        contactsRouter.navigate("filter/" + filterType);
		    }
		},

		// add new contact
		addContact: function(e) {
			e.preventDefault();

			var formData = {};
			$("#addContact").find("input").each(function (i, el) {
				if($(el).val() !== "") {
					formData[el.id] = $(el).val();
				}
			});


			//update data store
			if(formData.name !== undefined) 
				contacts.push(formData);
			else return;
			

			//re-render select if new type is unknown
			if(_.indexOf(this.getTypes(), formData.type) === -1) {
				this.collection.add(new Contact(formData));
				this.$el
					.find('.filter')
					.find('select').remove()
					.end()
					.append(this.createSelect());
			} else {
				this.collection.add(new Contact(formData));
			}

			this.showForm();

		},

		removeContact: function(removedModel) {
			var removed = removedModel.attributes;

			if(removed.photo === 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y') {
				delete removed.photo;
			}

			_.each(contacts, function(contact) {
				if(_.isEqual(contact, removed)) {
					contacts.splice(_.indexOf(contacts, contact), 1);
				}
			});
		},

		showForm: function () {
			
    	$('.modal-overlay').fadeToggle("fast", function() {
		    	$('.modal').slideToggle();
		    });
    }
	});

	var ContactsRouter = Backbone.Router.extend({
		routes: {
			"filter/:type": "urlFilter"
		},

		urlFilter: function(type) {
			directory.filterType = type;
			directory.trigger("change:filterType");
		}
	});
	
	var directory = new DirectoryView();
	var contactsRouter = new ContactsRouter();
	Backbone.history.start();
})();