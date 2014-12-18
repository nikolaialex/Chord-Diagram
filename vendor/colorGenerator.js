function generateColors(_config) {
    var numberOfColors = ((typeof _config.numberOfColors === 'undefined' || _config.numberOfColors === null) ? null : _config.numberOfColors),
        numberOfNuances = ((typeof _config.numberOfColors === 'undefined' || _config.numberOfColors === null) ? null : _config.numberOfColors),
        startColor = ((typeof _config.startColor === 'undefined' || _config.startColor === null) ? null : _config.startColor),
        endColor = ((typeof _config.endColor === 'undefined' || _config.endColor === null) ? null : _config.endColor),
        colorName = ((typeof _config.hue === 'undefined' || _config.hue === null) ? null : _config.hue);

    if (startColor === null && colorName === null) {
        //generateAlternatingDarkColorSet
        return (generateAlternatingDarkColorSet(numberOfColors));
    }
    else if (colorName !== null) {
        //generateSimilarColors
        return (generateSimilarColors(colorName, numberOfColors));
    }
    else {
        //generateColorGradient
        return (generateColorGradient(startColor, endColor, numberOfNuances));
    }
}
function generateAlternatingDarkColorSet(numberOfColors) {
    /*
        Format of the passed variable:
            numberOfColors: the number of different colors

        Task of the function:
            This function creates a several (numberOfColors) different colors. All colors are darker, so a white label is readable with the backgroundcolor

        Format of the return value:
            The function returns an array of the length numberOfColors with different colors.
    */

    var hueSet = [5, 105, 20, 200, 50, 170, 80, 320, 140, 70, 240];     //#11 [red(5), green1(105), orange(20), lightblue(200), yellow(50), aqua(170), lightgreen(80), purple(320), green2(140), yellow(70), blue(240)]
    var saturationSet = [60, 65, 70, 75, 80, 85, 90, 95, 100];          //#9
    var lightnessSet = [20, 30, 40, 45];                                //#4
    var hueNumerator = 0;
    var saturationNumerator = 0;
    var lightnessNumerator = 0;
    var colorSet = [];
    while (numberOfColors > 0) {
        var hue = hueSet[hueNumerator];
        var saturation = saturationSet[saturationNumerator];
        var lightness = lightnessSet[lightnessNumerator];
        var color = (HSL2Hex(hue, saturation / 100, lightness / 100));
        colorSet.push(color);

        hueNumerator++;
        hueNumerator = (hueNumerator > hueSet.length - 1) ? 0 : hueNumerator;
        saturationNumerator++;
        saturationNumerator = (saturationNumerator > saturationSet.length - 1) ? 0 : saturationNumerator;
        lightnessNumerator++;
        lightnessNumerator = (lightnessNumerator > lightnessSet.length - 1) ? 0 : lightnessNumerator;

        numberOfColors--;
    }
    return (colorSet)
}
function generateRandomDarkColorSet(numberOfColors) {
    /*
        Format of the passed variable:
            numberOfColors: the number of different colors

        Task of the function:
            This function creates a several (numberOfColors) different colors. All colors are darker, so a white label is readable with the backgroundcolor

        Format of the return value:
            The function returns an array of the length numberOfColors with different colors.
    */
    var colorSet = [];
    while (numberOfColors > 0) {
        var hue = Math.round(Math.random() * 360);
        var saturation = 60 + Math.round(Math.random() * 40);
        var lightness = 20 + Math.round(Math.random() * (50 - 20));
        var color = (HSL2Hex(hue, saturation / 100, lightness / 100));
        colorSet.push(color);
        numberOfColors--;
    }
    return (colorSet)
}
function generateColorGradient(startColor, endColor, numberOfNuances) {
    /*
        Format of the passed variable:
            startColor: A color in hexcode where the colorgradient should start
            endColor: A color in hexcode where the colorgradient should end
            numberOfNuances: the number of different nuances

        Task of the function:
            This function creates a colorgradient between the two colors startColor and endColor with several nuances

        Format of the return value:
            The function returns an array of the length numberOfNuances with different colors.
    */
    var startRedPart = startColor.slice(1, 3),
        startGreenPart = startColor.slice(3, 5),
        startBluePart = startColor.slice(5, 7),
        endRedPart = endColor.slice(1, 3),
        endGreenPart = endColor.slice(3, 5),
        endBluePart = endColor.slice(5, 7);

    var redNuances = Math.round((parseInt(endRedPart, 16) - parseInt(startRedPart, 16)) / numberOfNuances),
        greenNuances = Math.round((parseInt(endGreenPart, 16) - parseInt(startGreenPart, 16)) / numberOfNuances),
        blueNuances = Math.round((parseInt(endBluePart, 16) - parseInt(startBluePart, 16)) / numberOfNuances);
    var colorset = [], redPart, greenPart, bluePart, color;

    for (var count = 0; count < numberOfNuances; count++) {
        redPart = (parseInt(startRedPart, 16) + count * redNuances).toString(16);
        greenPart = (parseInt(startGreenPart, 16) + count * greenNuances).toString(16);
        bluePart = (parseInt(startBluePart, 16) + count * blueNuances).toString(16);
        color = '#' + (redPart.length === 1 ? '0' + redPart : redPart) + ''
            + (greenPart.length === 1 ? '0' + greenPart : greenPart) + ''
            + (bluePart.length === 1 ? '0' + bluePart : bluePart);
        colorset.push(color);
    }
    return colorset;
}
function generateSimilarColors(colorName, numberOfColors) {
    /*
        Format of the passed variable:
            colorName: gives the hue of the color in form of a word (e.g. red, yellow, green etc.)
            numberOfColors: the number of different colors

        Task of the function:
            This function creates several (numberOfColors) different colors. All colors have the same hue within a range for the same color. But the saturation and lightness can vary between the complete spectrum: 0-1
            
        Format of the return value:
            The function returns an array of the length numberOfColors with different colors.
    */
    var colorSet = [];
    var colorDictionary = loadColorDictionary();
    var hueMinimum = colorDictionary[colorName].hueRange[0];
    var hueMaximum = colorDictionary[colorName].hueRange[1];
    var saturationMinimum = colorDictionary[colorName].saturationRange[0];
    var saturationMaximum = colorDictionary[colorName].saturationRange[1];
    var lightnessMinimum = colorDictionary[colorName].lightnessRange[0];
    var lightnessMaximum = colorDictionary[colorName].lightnessRange[1];
    var saturationSet = [50, 60, 70, 80, 90, 100];                  //#6
    var lightnessSet = [20, 30, 40, 50, 60];                        //#5
    var hueNumerator = 0;
    var saturationNumerator = 0;
    var lightnessNumerator = 0;
    var count = 1;
    while (numberOfColors > 0) {
        if (colorName !== 'red') {
            var hue = hueMinimum + hueNumerator * 10;
        }
        else { //color is red. The spectrum is divided into two parts 
            var hue = hueMinimum + hueNumerator * 10;
            if (hue < 0) {
                hue = 360 + hue;
            }
        }
        var saturation = saturationMinimum + saturationNumerator * 5;
        var lightness = lightnessMinimum + lightnessNumerator * 5;

        saturationNumerator++;
        saturationNumerator = ((saturationMinimum + saturationNumerator * 5) > saturationMaximum) ? 0 : (saturationNumerator);
        lightnessNumerator++;
        lightnessNumerator = ((lightnessMinimum + lightnessNumerator * 5) > lightnessMaximum) ? 0 : (lightnessNumerator);
        hueNumerator++;
        hueNumerator = ((hueMinimum + hueNumerator * 10) > hueMaximum) ? 0 : (hueNumerator);

        var color = (HSL2Hex(hue, saturation / 100, lightness / 100));
        if (color.length <= 7) {
            colorSet.push(color);
            numberOfColors--;
        }
        else{}
    }

    return colorSet;
}

function loadColorDictionary() {
    var colorDictionary = {};
    colorDictionary['monochrome'] = {
        hueRange: null
    };
    colorDictionary['red'] = {
        hueRange: [-26, 18],
        saturationRange: [70, 100],
        lightnessRange: [40, 60]
    };
    colorDictionary['orange'] = {
        hueRange: [19, 46],
        saturationRange: [70, 100],
        lightnessRange: [45, 60]
    };
    colorDictionary['yellow'] = {
        hueRange: [47, 69],
        saturationRange: [70, 100],
        lightnessRange: [50, 50]
    };
    colorDictionary['green'] = {
        hueRange: [70, 178],
        saturationRange: [70, 100],
        lightnessRange: [40, 60]
    };
    colorDictionary['blue'] = {
        hueRange: [179, 257],
        saturationRange: [70, 100],
        lightnessRange: [30, 70]
    };
    colorDictionary['purple'] = {
        hueRange: [258, 300],
        saturationRange: [70, 100],
        lightnessRange: [40, 70]
    };
    colorDictionary['pink'] = {
        hueRange: [301, 334],
        saturationRange: [70, 100],
        lightnessRange: [50, 70]
    };

    return colorDictionary;
}
function HSL2Hex(hue, saturation, lightness) {
    //formula from www.rapidtables.com/convert/color/hsl-to-rgb.htm
    var c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    var x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    var m = lightness - c / 2;

    if (hue < 60) {
        var red = Math.round((c + m) * 256);
        var green = Math.round((x + m) * 256);
        var blue = Math.round(m * 256);

        return (RGB2Hex(red, green, blue));
    }
    else if (hue < 120) {
        var red = Math.round((x + m) * 256);
        var green = Math.round((c + m) * 256);
        var blue = Math.round(m * 256);

        return (RGB2Hex(red, green, blue));
    }
    else if (hue < 180) {
        var red = Math.round(m * 256);
        var green = Math.round((c + m) * 256);
        var blue = Math.round((x + m) * 256);

        return (RGB2Hex(red, green, blue));
    }
    else if (hue < 240) {
        var red = Math.round(m * 256);
        var green = Math.round((x + m) * 256);
        var blue = Math.round((c + m) * 256);

        return (RGB2Hex(red, green, blue));
    }
    else if (hue < 300) {
        var red = Math.round((x + m) * 256);
        var green = Math.round(m * 256);
        var blue = Math.round((c + m) * 256);

        return (RGB2Hex(red, green, blue));
    }
    else {
        var red = Math.round((c + m) * 256);
        var green = Math.round(m * 256);
        var blue = Math.round((m + m) * 256);

        return (RGB2Hex(red, green, blue));
    }
}
function RGB2Hex(red, green, blue) {
    var redPart = red.toString(16);
    var greenPart = green.toString(16)
    var bluePart = blue.toString(16)

    var color = "#" + (redPart.length === 1 ? '0' + redPart : redPart) + "" + (greenPart.length === 1 ? '0' + greenPart : greenPart) + "" + (bluePart.length === 1 ? '0' + bluePart : bluePart);

    return color;
}