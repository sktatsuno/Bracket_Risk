// Bracket instance
var Tournament = function() {
    // default values to pass to options
    var defaults = {
        width: 3,
        color: '#BBB',
        radius: 15,
        regionSelector: '.region'
    };

    return {
        // Initialize tournament bracket
        init: function(options) {
            this.options = $.extend(defaults, options);
            // Use canvas for bracket lines
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');

            this.firstRoundCalcs();
            this.bindEvents();
            this.render();
        },

        // Calculate advance rates and rel risk for first round games
        firstRoundCalcs: function() {

            let endpoint = "http://127.0.0.1:8800/seed"
            console.log(endpoint)
            $("div.team").each(function(){

                const thisTeam = $(this);
                const thisDataRound = thisTeam.data("round");
                console.log(thisTeam);
                const thisBestSeed = thisTeam.data("best-seed");
                console.log(thisBestSeed);
                const thisTeamSeed = thisTeam.children('.team-seed').text();
                console.log(thisTeamSeed);
                if(thisTeamSeed == 1){
                    console.log('Calling API');
                    $.ajax({
                        url: endpoint + "?seed=" + thisTeamSeed + "&rd=" + thisDataRound + "&best_seed=" + thisBestSeed,
                        async: true,
                        success: function(result){
                            console.log('printing result');
                            console.log(result);
                            thisTeam.children('.advance-rate').text(result['advance_rate']);
                            thisTeam.attr('data-rel-risk', result['rel-risk']);
                            thisTeam.attr('data-advances', result['advances']);
                            thisTeam.attr('data-opportunities', result['opportunities']);
                            }
                        })
                    };
                });
            },

        // Trigger events
        bindEvents: function() {
            var that = this;
            $(window).on('resize', this.render.bind(this));

            $('.team').on({
                mouseenter: function(e) {
                    $('.team-' + $(this).attr('data-team'))
                        .addClass('team-hover')
                        .css('background', $(this).css('border-left-color'));
                },
                mouseleave: function(e) {
                    $('.team-' + $(this).attr('data-team'))
                        .removeClass('team-hover')
                        .css('background', '');
                },
                click: function(e) {
//                    console.log($(this).children('.team-seed').text())
                    // Select winner
                    let thisTeam = $(this);
                    let thatTeam = $(thisTeam).next();
                    let thisGame = $(thisTeam).parent();
                    let thisRound = $(thisGame).parent();
                    let thisTeams = $(thisGame).children();
                    if(!$(thisTeams).hasClass("team-loser")){
                        $(thisTeam).addClass("team-winner");
                        $(thatTeam).addClass("team-loser");
                    } else if($(thisTeam).hasClass("team-loser")){
                        $(thisTeams).toggleClass(['team-winner', 'team-loser']);
                    }
                    // Move winner to next round
                    // Get game from next round
                    const thisID = $(this).attr('id');
                    const thisDataTeam = $(this).attr('data-team');
                    const thisTeamSeed = $(this).children('.team-seed').text();
                    const thisTeamName = $(this).children('.team-name').text();
                    const thisTeamClass = "team-" + thisDataTeam;
                    console.log(thisID);
                    console.log(thisDataTeam);
                    console.log(thisTeamSeed);
                    console.log(thisTeamName);
                    // this region
                    let thisRegion = thisID.match(/(rg\d)r\dg\dt\d/)[1];
                    console.log(thisRegion);
                    // this round
                    const thisRoundNum = parseInt(thisID.match(/rg\dr(\d)g\dt\d/)[1])
                    console.log(thisRoundNum)
                    // next round = round + 1
                    let nextRoundNum = (parseInt(thisID.match(/rg\dr(\d)g\dt\d/)[1]) + 1).toString();
                    console.log(nextRoundNum);
                    // this game number
                    let thisGameNum = parseInt(thisID.match(/rg\dr\dg(\d)t\d/)[1])
                    console.log(thisGameNum);
                    // next game number = game number/2 rounded up
                    let nextGameNum = Math.ceil(thisGameNum/2).toString();
                    console.log(nextGameNum);
                    // next team number is dependent on if game number odd or even
                    let nextTeamNum;
                    if (thisGameNum % 2 == 0) {
                        nextTeamNum = "2";
                    } else {
                        nextTeamNum = "1";
                    }
                    console.log(nextTeamNum);
                    //next team ID
                    let nextID = "#" + thisRegion + "r" + nextRoundNum + "g" + nextGameNum + "t" + nextTeamNum;
                    console.log(nextID);
                    // assign team values to next id
                   $(nextID).children('.team-seed').text(thisTeamSeed);
                   $(nextID).children('.team-name').text(thisTeamName);
                   $(nextID).attr('data-team', thisDataTeam);
                   // remove all classes
                   $(nextID).removeClass()
                   // add team class and specific team class
                   $(nextID).addClass("team")
                   $(nextID).addClass(thisTeamClass);
                    that.render();
                }
            });
        },
        // Render js elements
        render: function() {
            var w = $(document).width();
            var h = $(document).height();
            this.canvas.width  = w * 2; // retina
            this.canvas.height = h * 2; // retina
            this.canvas.style.width  = w + 'px';
            this.canvas.style.height = h + 'px';
            this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
            this.ctx.scale(2, 2); // retina

            var that = this;

            // color each team based on relative advance rate if it exists
            $("div.team").each(function(){
                var relRisk = $(this).data("rel-risk");
                if ($.isNumeric(relRisk)) {
                    var color = '#d1001c';
                    if (relRisk < 0.90) {
                        color = '#E03E20';
                    }
                    if (relRisk < 0.75) {
                        color = '#EF7C24';
                    }
                    if (relRisk < 0.50) {
                        color = '#ffc100';
                    }
                    if (relRisk < 0.35) {
                        color = '#9ACD32';
                    }
                    if (relRisk < 0.25) {
                        color = '#228C22';
                    }
                    if (relRisk < 0.10) {
                        color = '#31c831';
                    }
                    if (relRisk == 0) {
                        color = '#00B8EA';
                    }
                    $(this).css('border-color', color);
                }
            });

            // For each region
            $(this.options.regionSelector).each(function() {
                // Right align if region should be on the right side
                var rightAlign = $(this).hasClass('region-right');
                // For each round
                $(this).find('.round').each(function(round) {
                    // Get games from the next round?
                    var $nextGames = $(this).next('.round').find('.game');
                    if (!$nextGames.length) return;
                    // For each game in current round
                    $(this).find('.game').each(function(i) {
                        // Find the winner
                        var $winner   = $(this).find('.team-winner'),
                            // Next round has half the amount of games so the next game is index of current game divided by 2
                            $nextGame = $nextGames.eq( Math.floor(i/2) ),

                            color = $winner.length ? $winner.css('border-left-color') : that.options.color,
                            width = $winner.length ? that.options.width : 0.5,

                            calcFn = rightAlign ? that.calcLeft : that.calcRight,
                            start  = calcFn( $winner.length ? $winner : $(this) );

                        if (round == 0) {
                            // for first round need to assign colors to both teams
                            // s-curve
                            var endNode = $nextGame;
                            if ($winner.length) {
                                endNode = $nextGame.find('.team-' + $winner.attr('data-team'));
                            }
                            calcFn  = rightAlign ? that.calcRight : that.calcLeft;
                            var end = calcFn(endNode);
                            var radiusAdjust = Math.min(that.options.radius, Math.abs(start.y - end.y)/2);
                            that.drawSCurve(start, end, color, width, that.options.radius, radiusAdjust);
                        } else {
                            // single curve for collapsed columns
                            var end = that.calcCenter($nextGame);
                            that.drawCurve(start, end, 'horizontal', color, width, that.options.radius);
                        }
                    }); // /game
                }); // /round
            }); // /region
        },

        // Calculate center points
        // +-----+
        // |     x
        // +-----+
        calcRight: function ($object) {
            return {
                x: $object.offset().left + $object.outerWidth(),
                y: $object.offset().top  + $object.outerHeight() / 2
            };
        },
        // +-----+
        // x     |
        // +-----+
        calcLeft: function ($object) {
            return {
                x: $object.offset().left,
                y: $object.offset().top  + $object.outerHeight() / 2
            };
        },
        // +-----+
        // |  x  |
        // +-----+
        calcCenter: function ($object) {
            return {
                x: $object.offset().left + $object.outerWidth()  / 2,
                y: $object.offset().top  + $object.outerHeight() / 2
            };
        },

        drawLine: function (start, end) {
            this.ctx.moveTo( start.x, start.y );
            this.ctx.lineTo(   end.x,   end.y );
        },

        // one curve
        drawCurve: function (start, end, orientation, color, width, radius, radius2) {
            if (!radius2) radius2 = radius;
            this.ctx.beginPath();

            if (orientation == 'horizontal') {
                var anchor = { x:   end.x, y: start.y };
            } else {
                var anchor = { x: start.x, y:   end.y };
            }

            // calculate the point a certain distance along the line
            var m1 = this.lineDistanceFromEnd(start, anchor, radius);
            var m2 = this.lineDistanceFromEnd(end,   anchor, radius2);

            this.drawLine(start, m1);
            this.ctx.bezierCurveTo(m1.x, m1.y, anchor.x, anchor.y, m2.x, m2.y);
            this.drawLine(m2, end);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth   = width;
            this.ctx.lineCap     = 'square';
            this.ctx.stroke();
            this.ctx.closePath();
        },

        // two curves
        drawSCurve: function (start, end, color, width, radius, radius2) {
            var midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
            if (!radius2) radius2 = radius;

            this.drawCurve(start,    midpoint, 'horizontal', color, width, radius, radius2);
            this.drawCurve(midpoint, end,      'vertical',   color, width, radius2, radius);
        },

        lineDistanceFromEnd: function (start, end, d) {
            var x = end.x, y = end.y;

            if (end.x - start.x < 0) x += d; // left
            if (end.x - start.x > 0) x -= d; // right
            if (end.y - start.y < 0) y += d; // up
            if (end.y - start.y > 0) y -= d; // down

            return { x: x, y: y };
        }

    };
};


$(document).ready(function() {
    var tournament = new Tournament();
    tournament.init();
});