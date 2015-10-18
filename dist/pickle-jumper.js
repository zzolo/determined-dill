/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, $:false, Phaser:false */

/**
 * Main JS for Pickle Jumper
 */

"use strict";

(function () {
  "use strict";

  // Ensure we have the pickle jumper parts
  var pickleJumper = window.pickleJumper || {};

  // Constructore for Pickle
  var Pickle = window.Pickle = function (options) {
    this.options = options;
    this.el = this.options.el;
    this.$el = $(this.options.el);
    this.$ = function () {
      return $(options.el).find;
    };

    this.width = this.$el.width();
    this.height = $(window).height();
  };

  // Add properties
  _.extend(Pickle.prototype, {
    // Start everything
    start: function start() {
      // Create Phaser game
      this.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, this.el.replace("#", ""));

      // Add reference to game, since most parts have this reference
      // already
      this.game.pickle = this;

      // Register states
      this.game.state.add("menu", pickleJumper.states.menu);

      // Start with menu
      this.game.state.start("menu");
    }
  });

  // Create app
  var p = new Pickle({
    el: "#pickle-jumper"
  });
  p.start();
})();