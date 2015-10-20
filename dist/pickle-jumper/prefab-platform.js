/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Prefab (objects) object for platforms
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor for main character
  pj.prefabs.Platform = function (game, x, y, platformType) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "pixel_purple_10.png");

    // Configure
    this.platformType = platformType;
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(10, 2);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  pj.prefabs.Platform.prototype = Object.create(Phaser.Sprite.prototype);
  pj.prefabs.Platform.prototype.constructor = pj.prefabs.Platform;

  // Add methods
  _.extend(pj.prefabs.Platform.prototype, {
    update: function update() {}
  });
})();