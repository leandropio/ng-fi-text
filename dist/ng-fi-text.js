/*! ng-fi-text v0.1.0 - 2014-11-10 
 *  License: MIT 
 *  Author: Leandro Bessone */


angular.module('ng-fi-text', [])
.directive('ngFiText', ['$window', function ( $window ) {

    "use strict";
    
    return {

     restrict: 'A',
     scope :{ngFiText:'@', ngFiTextHtml:'@' },
     link: function postLink(scope, element, attrs) {


         if(!window.jQuery){
            console.error('ng-fi-text needs jQuery to work. Sory :(');
                return;
            }


        // Options
        var rotate = attrs.ngFiTextRotate || false;
        var maxFontSize = attrs.ngFiTextMaxFontSize || false;
        // var minFontSize = attrs.ngFiTextMinFontSize || false;
        //var lineHeightMultiplier = attrs.ngFiTextLineHeightMultiplier || false;
        var implementationType = attrs.hasOwnProperty( 'ngFiTextHtml' ) ? 'html' : 'text';


        // Internal Options
        var heightTolerance = 3;
        var fontSize = 10;
        var loopLimiter = 25; // higher is more accurate but increases process. Min 5~6

        var executionOdometer = 0;
        



        // Creating the element
        var rotateToAdd = rotate ? ' rotate('+rotate+'deg) ' : '';
        var textElem = angular.element('<div />').attr('style',
            'word-wrap: break-word;'+
            'line-height: normal;'+
            'margin: 0px;'+
            //'padding: 0px;'+
            'position: absolute; '+
            'left:0px;'+
            'right: 0px;'+
            'top: 50%;'+
            '-webkit-transform: translate(0%,-50%) '+rotateToAdd+';'+
            '-moz-transform: translate(0%,-50%) '+rotateToAdd+';'+
            '-ms-transform: translate(0%,-50%) '+rotateToAdd+';'+
            'transform: translate(0%,-50%) '+rotateToAdd+';'
            );
        element.html(textElem);



        function contentFilling( callback ){

            var text = '';

            if(implementationType === 'html'){
                text = attrs.ngFiTextHtml || element.html()  || '';
            }else{
                text = attrs.ngFiText || element.text() || '';
            }

            // Populating the DOM
            textElem[implementationType](text);

            if(callback)
                callback();

        } // contentFilling



        function executeMagic(){

        	onStarted();

            executionOdometer++;

            var elementParent = textElem.parent();
            var elemParentHeight = elementParent.height();
            //var elemParentWidth = elementParent.width(); 

            var elemHeight;
            var heightDiff;

            var baseCorrection = 10;
            var definitiveCorrection;

            var direction;
            var prevDirection = false;
            
            var currLoop = 1;
            var currXLoop = 0;
            var correctionMultiplier = 1;

            var newFontSize = fontSize;


            heightDiff = elemParentHeight - elemHeight;

            var lastSameDirectionDiff = '', preLastSameDirectionDiff = '';
            var lesserDiff = false;
            var lesserSize = false;


            function grossCorrection( executionNumber ) {

            	if (currLoop > loopLimiter){
            		//console.log('no more loops :(');
            			//console.log('----------------------------------------- no + loops');
            			onFinished( newFontSize );
            			return;
            		}

                    onLoopStarted();


                    textElem.css('font-size', newFontSize+'px');
                    if(implementationType === 'html'){
                        textElem.children().css('font-size', newFontSize+'px');
                    }

                    window.setTimeout(function() {

                        if(executionNumber !== executionOdometer){
                            return;
                        }

                        elemHeight = textElem.height();
                        heightDiff = elemParentHeight - elemHeight;



                        if( heightDiff >= 0 && (heightDiff < lesserDiff  || !lesserDiff ) ){
                            lesserDiff =  heightDiff;
                            lesserSize = newFontSize;
                        }


                        direction = heightDiff >= 0 ? 1 : -1;


                        if(prevDirection && prevDirection !== direction){

                            if( preLastSameDirectionDiff === heightDiff ){
            					//console.log('------------------ deberia parar -----------');
            					if( newFontSize !== lesserSize ){
            						textElem.css('font-size', lesserSize+'px');
                                    if(implementationType === 'html'){
                                        textElem.children().css('font-size', lesserSize+'px');
                                    }
                                }
            					//console.log('----------------------------------------- dp');
            					onFinished( newFontSize );
            					return;

            				}

            				preLastSameDirectionDiff = lastSameDirectionDiff;
            				lastSameDirectionDiff = heightDiff;

            				currXLoop++;
            				correctionMultiplier = correctionMultiplier * ( 1 - 0.25 * currXLoop );
            				correctionMultiplier = correctionMultiplier < 0.05 ? 0.05 : correctionMultiplier;
            			}


            			prevDirection = direction;
            			definitiveCorrection = baseCorrection * correctionMultiplier * direction;
            			newFontSize = newFontSize + definitiveCorrection;

            			/* 
                        console.log( 
            				'l'+currLoop +
            				' | LSD:'+lastSameDirectionDiff+
            				' | ldif:'+lesserDiff+
            				' | elHght:'+elemHeight + 
            				' | hDiff:'+heightDiff + 
            				' | cx:'+correctionMultiplier+
            			    ' | def_corr:'+definitiveCorrection + 
            			    ' | newFontSize:'+newFontSize + 
            			    '');
*/

currLoop++;


if(  Math.abs( heightDiff ) > heightTolerance ){
    grossCorrection( executionOdometer );
}else{
            				//console.log('-----------------------------------------end');
            				onFinished( newFontSize );
            			}
            		}, 0);
            }//gross

            grossCorrection( executionOdometer );


        } // executeMagic




        function onStarted(){
         textElem.css('visibility', 'hidden');
     }

     function onLoopStarted(){

     }

     function onFinished( finalFontSize ){

        if( maxFontSize && finalFontSize > maxFontSize){
            textElem.css('font-size', maxFontSize+'px');
        }

        textElem.css('visibility', 'visible');
    }

    function onResizeStarted(){
        textElem.css('visibility', 'hidden');
    }

// window resizing responsivenes
var timeoutHolder;
angular.element($window).bind('resize', function () {
	window.clearTimeout(timeoutHolder);
    onResizeStarted();
    timeoutHolder = window.setTimeout( executeMagic, 150);

});


// update on values changing
scope.$watchGroup(['ngFiText','ngFiTextHtml'],function(newValue,oldValue) {
    contentFilling(executeMagic);
});


// Staring the magic...
contentFilling(executeMagic);


}
};
}]);





