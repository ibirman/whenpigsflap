'use strict';
/* Flap.js for When Pigs Flap
Copyright (C) 2014 @ibirman and @lotz1227

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/*jslint browser: true, sloppy: true, indent: 4 */
/*global $, jQuery, Audio*/

var nextColId;
var avatarPosition;
var score;
var scrollSpeed = 15;
var fallSpeed = 100;
var offsetHeight = 210;
var gameInProgress = false;
var flapSound = new Audio("Sounds/whenpigsflap2.wav");
var groundPosition = 500;
var gravityFactor = 1.2;

var riseRate;

var fallRate;
var fallInterval;
var fallAnimationRate = 50;
var lastFallTime;

var scrollInterval;
var scrollAnimationRate = 10;
var lastScrollTime;

function Setup() {
    nextColId = "01";
    fallRate = 1;
    riseRate = 1;
    score = 0;
    $("#table")[0].deleteRow(0);
    $("#table")[0].insertRow(0);
    $("#score").attr("class", "alert alert-info");

    var height = GetRandomHeight();
    BuildCol(nextColId++, height);
    avatarPosition = height + offsetHeight;

    for (var i = 1; i < 8; i++) {
        BuildCol(nextColId++, GetRandomHeight());
    }

    $("#avatar")[0].style.top = avatarPosition + "px";
    $("#avatar").attr("src", "Images/pigsfly.gif");
    $("#flapButton").attr("disabled","disabled");
}

function Start() {
    if (gameInProgress) return;
    Setup();
    $("#score").html("Score: 0");
    window.document.body.onkeydown = function (event) {
        if (event.keyCode == "32") Flap(); 
    };
    gameInProgress = true;
    $("#startButton").attr("disabled","disabled");
    $("#flapButton").attr("disabled",null);

    lastScrollTime = new Date().getTime();
    Scroll(0);

    lastFallTime = new Date().getTime();
    Fall(0);
}

function Flap() {
    if (!gameInProgress) return;
    $("#avatar").attr("src", "Images/pigwingsflapping.gif");
    flapSound.currentTime = 0;
    flapSound.play();
    window.setTimeout(function () { $("#avatar").attr("src", "Images/pigsfly.gif"); }, 100);
    if (!gameInProgress) return;
    avatarPosition -= 10 * riseRate;
    riseRate = riseRate * gravityFactor;
    fallRate = 1;
    $("#avatar")[0].style.top = avatarPosition + "px";
}

function Scroll(lastScrollAnimationTime) {
    if (!gameInProgress) return;
    var time = new Date().getTime();
    requestAnimationFrame(Scroll);
    if (lastScrollAnimationTime > 0 && time - lastScrollTime < scrollAnimationRate) return;
    lastScrollTime = new Date().getTime();

    var table = $("#table")[0];
    var width = table.getElementsByClassName("top")[0].style.marginLeft.replace("px", "");
    if (width == "") width = 100;
    if (width == -49) {
        table.getElementsByTagName("tr")[0].deleteCell(0);
        BuildCol(nextColId++, GetRandomHeight());
        $("#score").html("Score: " + ++score);
        return;
    }
    width--;
    table.getElementsByClassName("top")[0].style.marginLeft = width + "px";
    table.getElementsByClassName("bottom")[0].style.marginLeft = width + "px";

    if (CheckCollision()) {
        GameOver("Collision!");
    }
}

function Fall(lastAnimationTime) {
    if (!gameInProgress) return;
    var time = new Date().getTime();
    requestAnimationFrame(Fall);
    if (lastAnimationTime > 0 && time - lastFallTime < fallAnimationRate) return;
    lastFallTime = new Date().getTime();
    if (avatarPosition > groundPosition) {
        GameOver("Fell To the Ground.");
    }
    avatarPosition += 1 * fallRate;
    if (fallRate > 2) riseRate = 1;
    fallRate = fallRate * gravityFactor;
    $("#avatar")[0].style.top = avatarPosition + "px";
}

function GameOver(message) {
    window.document.body.onkeydown = null;
    window.clearInterval(scrollInterval);
    $("#score").attr("class", "alert alert-danger");
    $("#score").append(" GAME OVER! " + message);
    $("#avatar").attr("src", "Images/deadpig.gif");
    gameInProgress = false;
    $("#startButton").attr("disabled",null);
    $("#flapButton").attr("disabled","disabled");
}

function GetRandomHeight() {
    return Math.floor(Math.random() * 10) * 10 + 50;
}

function CheckCollision() {
    var table = $('#table')[0];
    var width = table.getElementsByClassName("top")[0].style.marginLeft.replace("px", "") * 1;
    if (width > 5 && width < 55) {
        var topHeight = table.getElementsByClassName("top")[0].style.height.replace("px", "") * 1 + offsetHeight;
        if (avatarPosition > topHeight && avatarPosition < topHeight + 50) return false;
        return true;
    }
    return false;
}

function BuildCol(id, topHeight) {
    var row = window.document.getElementById("table").getElementsByTagName("tr")[0];
    var cell = window.document.createElement("td");
    cell.id = "C" + id;
    cell.appendChild(GetDivWithClassName("roof"));
    cell.appendChild(GetDivWithClassName("top", topHeight));
    cell.appendChild(GetDivWithClassName("gap", 100));
    cell.appendChild(GetDivWithClassName("bottom", 200 - topHeight));
    cell.appendChild(GetDivWithClassName("floor"));
    row.appendChild(cell);
}

function GetDivWithClassName(className, height, content) {
    var div = window.document.createElement("div");
    div.className = className;
    if (content != null) {
        div.innerHTML = content;
    }
    else {
        div.innerHTML = "&nbsp;";
    }
    if (height != null) div.style.height = height + "px";
    return div;
}
$(document).ready(function () {
    Setup();
});

// requestAnimationFrame Fix for Android
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik MÃ¶ller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            window.clearTimeout(id);
        };
}());
