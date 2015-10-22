/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Prefab for Botulism, the bad dudes
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor
  pj.prefabs.Botulism = function (game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "botchy.png");

    // Size
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(this.game.width / 10 / this.width);

    // Configure
    this.hover = true;
    this.setHoverSpeed(100);
    this.hoverRange = 100;

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;

    // Determine anchor x bounds
    this.paddingX = 10;
    this.resetPlacement(x, y);
  };

  // Extend from Sprite
  pj.prefabs.Botulism.prototype = Object.create(Phaser.Sprite.prototype);
  pj.prefabs.Botulism.prototype.constructor = pj.prefabs.Botulism;

  // Add methods
  _.extend(pj.prefabs.Botulism.prototype, {
    update: function update() {
      // Do hover
      if (this.hover) {
        this.body.velocity.x = this.body.velocity.x || this.hoverSpeed;
        this.body.velocity.x = this.x <= this.minX ? this.hoverSpeed : this.x >= this.maxX ? -this.hoverSpeed : this.body.velocity.x;
      }
    },

    // Set hover speed.  Add a bit of variance
    setHoverSpeed: function setHoverSpeed(speed) {
      this.hoverSpeed = speed + this.game.rnd.integerInRange(-25, 25);
    },

    // Get anchor bounds.  This is relative to where the platform is
    getAnchorBoundsX: function getAnchorBoundsX() {
      this.minX = Math.max(this.x - this.hoverRange, this.paddingX + this.width / 2);
      this.maxX = Math.min(this.x + this.hoverRange, this.game.width - (this.paddingX + this.width / 2));
      return [this.minX, this.maxX];
    },

    // Reset things
    resetPlacement: function resetPlacement(x, y) {
      this.reset(x, y);
      this.body.velocity.x = 0;
      this.getAnchorBoundsX();
    }
  });
})();