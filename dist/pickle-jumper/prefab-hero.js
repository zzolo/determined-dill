/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Prefab (objects) object for main character
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor for main character
  pj.prefabs.Hero = function (game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "main-pickle.gif");
    this.anchor.setTo(0.5, 0.5);
    this.game.physics.arcade.enableBody(this);
  };

  // Extend from Sprite
  pj.prefabs.Hero.prototype = Object.create(Phaser.Sprite.prototype);
  pj.prefabs.Hero.prototype.constructor = pj.prefabs.Hero;

  // Add methods
  _.extend(pj.prefabs.Hero.prototype, {
    update: function update() {}
  });
})();