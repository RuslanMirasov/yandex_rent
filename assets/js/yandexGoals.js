//Клик по логотипу в шапке - ClickOnLogoInHeader
document.querySelector('.logo').addEventListener('click', () => registerEvent('ClickOnLogoInHeader'));

//Клик «Начать» на стартовой - ClickOnStartButton
document.querySelector('#startButton').addEventListener('click', () => registerEvent('ClickOnStartButton'));

//Клик «Развеять страх» на онбординге - ClickOnTurnLightButtonOnboarding
//document.querySelector('#turnLightButtonOnboarding').addEventListener('click', () => registerEvent('ClickOnTurnLightButtonOnboarding'));

//Клик «Развеять страх» в 1 вопросe - ClickOnTurnLightInQuestion1
document.querySelector('#turnLightInQuestion1').addEventListener('click', () => registerEvent('ClickOnTurnLightInQuestion1'));

//Клик «Развеять страх» в 2 вопросe - ClickOnTurnLightInQuestion2
document.querySelector('#turnLightInQuestion2').addEventListener('click', () => registerEvent('ClickOnTurnLightInQuestion2'));

//Клик «Развеять страх» в 3 вопросe - ClickOnTurnLightInQuestion2
document.querySelector('#turnLightInQuestion3').addEventListener('click', () => registerEvent('ClickOnTurnLightInQuestion3'));

//Клик «Развеять страх» в 4 вопросe - ClickOnTurnLightInQuestion4
document.querySelector('#turnLightInQuestion4').addEventListener('click', () => registerEvent('ClickOnTurnLightInQuestion4'));

//Клик «Развеять страх» в 5 вопросe - ClickOnTurnLightInQuestion5
document.querySelector('#turnLightInQuestion5').addEventListener('click', () => registerEvent('ClickOnTurnLightInQuestion5'));

//Клик «Развеять страх» в 6 вопросe - ClickOnTurnLightInQuestion6
document.querySelector('#turnLightInQuestion6').addEventListener('click', () => registerEvent('ClickOnTurnLightInQuestion6'));

//Клик «Развеять страх» в 7 вопросe - ClickOnTurnLightInQuestion7
document.querySelector('#turnLightInQuestion7').addEventListener('click', () => registerEvent('ClickOnTurnLightInQuestion7'));

//Клик по подарку - ClickOnPresent
document.querySelectorAll('.get-present-button').forEach(presentButton => {
  presentButton.addEventListener('click', () => registerEvent('ClickOnPresent'));
});

////Клик по правилам акции - ClickOnRules
//document.querySelector('#linkOnRules').addEventListener("click", () => registerEvent("ClickOnRules"));

//Клик по правилам акции - ClickOnRules
document.querySelector('#learnMoreButton').addEventListener('click', () => registerEvent('ClickOnLearnMoreButton'));

function registerEvent(eventName) {
  try {
    console.log('send event: ' + eventName);

    // ToDo: send event to GA
    //gtag('event', eventName);

    ym(100726105, 'reachGoal', eventName);
  } catch (e) {
    console.error(e);
  }
}

// Делаем функцию глобальной
window.registerEvent = registerEvent;
