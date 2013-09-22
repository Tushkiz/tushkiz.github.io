var app = app || {};

/* Tile Model
 * ----------
 */

app.Tile = Backbone.Model.extend({
  defaults: {
    phrase: '',
    image: '',
    overlayImage: 'img/default_overlay.gif',
    flipped: false,
    matchFound: false
  }
});

/* Tiles Collection
 * ----------------
 */

app.Tiles = Backbone.Collection.extend({
  model: app.Tile
});


/* Tiles View
 * ----------
 */

app.TileView = Backbone.View.extend({

  tagName: 'div',
  className: 'tile',

  // Template
  template: _.template( '<img src="<%= flipped ? image : overlayImage %>" alt="<%= flipped ? phrase : "Guess?" %>">' ),

  // Events
  events: {
    'click .tile img': 'revealTile'
  },

  render: function() {
    this.$el.html( this.template( this.model.toJSON() ) );
    if(this.model.get('matchFound')) {
      this.$el.empty();
      this.$el.toggleClass('hidden');
    }
    return this;
  },

  revealTile: function() {
    if (app.activeTiles.length < 2) {
      this.model.set('flipped', true);
      this.$el.toggleClass('active');
      this.render();

      app.activeTiles.add(this.model); // add the model to active tiles collection

      app.totalTries = app.totalTries + 1;

      var phrase = app.activeTiles.pluck('phrase');

      if (phrase.length === 2) {
        if (phrase[0] == phrase[1]) {
          this.success();
        } else {
          this.failure();
        }
      }
    };

  },

  success: function() {
    app.activeTiles.each(function (tile) {
      tile.set('matchFound', true);
    });

    $('.message').hide().text('Match Found!').slideDown(100);
    var self = this;
    setTimeout(function() {
        $('.message').text('Removed Matching tiles!').delay(1000).fadeOut(500);
          self.finalize();
          if(app.remainingTiles === 0) {
            app.appView.gameComplete();
          }
      }, 1500);

    app.remainingTiles = app.remainingTiles - 2;
  },

  failure: function() {
    app.activeTiles.each(function (tile) {
      tile.set('flipped', false);
    });
    $('.message').text('Tiles do not match!');
    app.appView.collection.add(app.activeTiles.toArray());
    $('.message').hide().slideDown(100).delay(1000).fadeOut(500);
    var self = this;
    setTimeout(function() {
        self.finalize();
      }, 1500);
  },

  finalize: function() {
    app.appView.render();
    app.activeTiles.reset();
  }
});

/* Application View
 * ----------------
 */

app.AppView = Backbone.View.extend({

  el: '.board',

  // Tiles Collection
  collection : new app.Tiles(),

  events: {
    'click .bttn': 'restartGame'
  },

  //scores view template
  scoresTemplate: _.template('<div class="scores"> <h1>Kudos! You Won!!</h1> <h2>Score = <%= scores %>%</h2> <a class="bttn large" href="#">Play Again</a> </div>'),

  initialize: function() {

    var self = this,
        rndNum = this.randomNum(6,12);

    app.remainingTiles = app.numOfTiles = rndNum * 2;

    // Get data from words.json
    $.getJSON('/game/js/words.json', function(json) {
      for (var i = 0; i < rndNum; i++) {
        // preload images
        self.preloadImage(json.data[i].image);

        // add data into collection
        self.collection.add(json.data[i]);
        self.collection.add(json.data[i]);
      };
      self.postInit();
    });
  },

  postInit: function() {
    this.collection.reset(this.collection.shuffle());
    this.render();
  },

  render: function() {
    this.$el.empty();
    _.each(this.collection.models, function(tile) {
      this.renderTile(tile);
    },this);
  },

  renderTile: function(tile) {
    var tileView = new app.TileView({
        model: tile
    });

    this.$el.append(tileView.render().el);
  },

  restartGame: function() {
    app.totalTries = 0;
    app.activeTiles.reset();
    this.collection.reset();
    $('#wrap').slideDown();
    this.initialize();
  },

  gameComplete: function() {
    this.collection.reset();
    this.render();
    $('#wrap').slideUp();
    $('.message').hide();
    var scores = Math.round((app.numOfTiles / app.totalTries) * 100);
    this.$el.append(this.scoresTemplate({scores: scores}));
  },

  randomNum: function(from, to) {
    return Math.floor((Math.random()*(to - from + 1)) + from);
  },

  preloadImage: function (url) {
    var _img = new Image();
    _img.src = url;
  }
});

/* Application Script
 * ------------------
 */

$(function() {

  // App conf
  app.totalTries = 0;

  // Active Tiles Collection
  app.activeTiles = new app.Tiles(),

  // Start the App
  app.appView = new app.AppView();

  app.reset = function() {
    app.totalTries = 0;
    app.activeTiles.reset();
    app.appView.restartGame();
  };

  $('.bttn').on('click', function() {
    app.reset();
  });

  /* Parallax Effect */
  var floor = Math.floor;
  if (window.screen.availWidth > 35*16) {
    $('html').on('mousemove', function(e) {
      $('body').css({
        'background-position': floor(e.pageX/-20) + 'px ' + floor(e.pageY/-20) + 'px'
      });
    });
  }
  /* --------------- */

});
