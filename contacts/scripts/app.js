//(function(){
	var contacts = [
	{ name: "Tushar", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "tushar@me.com", type: "family" },
    { name: "Shridhar", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "shridhar@me.com", type: "college" },
    { name: "Pratik", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "pratik@me.com", type: "school" },
    { name: "Onkar", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "onkar@me.com", type: "college" },
    { name: "Rahul", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "rahul@me.com", type: "college" }
	];

	// Model
	var Contact = Backbone.Model.extend({
		defaults: {
			name: "",
			address: "",
			tel: "",
			email: "",
			type: "",
			photo: "images/placeholder.jpg"
		}
	});

	
	// Collection
	var Directory = Backbone.Collection.extend({
		model: Contact
	});

	// View for Contact
	var ContactView = Backbone.View.extend({
		tagName: 'article',
		className: 'card',
		template: $('#contactCardTemplate').html(),
		editTemplate: _.template($("#contactEditTemplate").html()),

		render: function() {
			var tmpl = _.template(this.template);

			this.$el.html(tmpl(this.model.toJSON()));
			return this;
		},

		// events
		events: {
            "click li.delete a": "deleteContact",
            "click li.edit a": "editContact",
            "click li.hide a": "hideContact",
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
		    $('.modal-overlay').fadeIn();
		    $('.modal').slideDown();
		    var newOpt = $("<option/>", {
		        html: "<em>Add new...</em>",
		        value: "addType"   
		    });
		 	
		 		
		    this.select = directory.createSelect().addClass("type")
		        .val(this.$el.find("#type").val()).append(newOpt)
		        .appendTo(this.$el.find("#typeControl"));
		 
		    this.$el.find("input[type='hidden']").remove();
		},

		hideContact: function() {
			this.$el.find(".info").toggleClass('hidden');
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
          					formData[el.attr("id")] = el.val();
      					});

    	//use default photo if none supplied
      if (formData.photo === "") {
          delete formData.photo;
      }

      //update model
      this.model.set(formData);

      //render view
      this.render();

            //if model acquired default photo property, remove it
			if(prev.photo === "images/placeholder.jpg") {
				delete prev.photo;
			}

			_.each(contacts, function(contact) {
				if(_.isEqual(contact, prev)) {
					contacts.splice(_.indexOf(contacts, contact), 1, formData);
				}
			});
			
		},

		cancelEdit: function() {

			this.render();
		}		
	});

	var DirectoryView = Backbone.View.extend({
		el: $('.contacts-container'),

		initialize: function() {
			this.collection = new Directory(contacts);

            this.render();
            this.$el.find(".filter").append(this.createSelect()); 

            this.on("change:filterType", this.filterByType, this);
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.renderContact, this);
            this.collection.on("remove", this.removeContact, this);
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

		//add ui events
        events: {
            "change .filter select": "setFilter",
            "click #add": "addContact",
            "click #showForm": "showForm"
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

		},

		removeContact: function(removedModel) {
			var removed = removedModel.attributes;

			if(removed.photo === 'images/placeholder.jpg') {
				delete removed.photo;
			}

			_.each(contacts, function(contact) {
				if(_.isEqual(contact, removed)) {
					contacts.splice(_.indexOf(contacts, contact), 1);
				}
			});
		},

		showForm: function () {
    	this.$el.find("#addContact").slideToggle();
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
//})();