/* global _:false, Phaser:false */

/**
 * Prefab (objects) object for platforms
 */

(function() {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor for main character
  pj.prefabs.Platform = function(game, x, y, width) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "pixel_purple_10.png");

    // Configure
    this.anchor.setTo(0.5, 0.5);
    this.scale.x = (width) ? width / 10 : 10;
    this.scale.y = 2;
    this.hover = false;
    this.setHoverSpeed(100);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;

    // Determine anchor x bounds
    this.paddingX = 10;
    this.getAnchorBoundsX();
  };

  // Extend from Sprite
  pj.prefabs.Platform.prototype = Object.create(Phaser.Sprite.prototype);
  pj.prefabs.Platform.prototype.constructor = pj.prefabs.Platform;

  // Add methods
  _.extend(pj.prefabs.Platform.prototype, {
    update: function() {
      if (this.hover) {
        this.body.velocity.x = this.body.velocity.x || this.hoverSpeed;
        this.body.velocity.x = (this.x <= this.minX) ? this.hoverSpeed :
          (this.x >= this.maxX) ? -this.hoverSpeed : this.body.velocity.x;
      }
    },

    // Set hover speed.  Add a bit of variance
    setHoverSpeed: function(speed) {
      this.hoverSpeed = speed + this.game.rnd.integerInRange(-50, 50);
    },

    // Get anchor bounds
    getAnchorBoundsX: function() {
      this.minX = this.paddingX + (this.width / 2);
      this.maxX = this.game.width - (this.paddingX + (this.width / 2));
      return [this.minX, this.maxX];
    },

    // Reset things
    resetSettings: function(width) {
      this.reset(0, 0);
      this.body.velocity.x = 0;
      this.scale.x = (width) ? width / 10 : 10;
      this.hover = false;
      this.getAnchorBoundsX();
    }
  });
})();
