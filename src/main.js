import './css/index.css';
import IMask from 'imask';
import swal from 'sweetalert';
import domtoimage from 'dom-to-image';
import VanillaTilt from 'vanilla-tilt';

// card hover effect
const card = document.querySelector('.cc');
VanillaTilt.init(card, {
    max: 20,
    speed: 350,
    glare: true
});

// Personalizing card
const cardBgColor1 = document.querySelector('.cc-bg svg > g g:nth-child(1) path');
const cardBgColor2 = document.querySelector('.cc-bg svg > g g:nth-child(2) path');
const cardLogo = document.querySelector('.cc-logo span:nth-child(2) img');

const setCardType = (type, ext) => {
    const colors = {
        visa: ['#436d99', '#2d57f2'],
        mastercard: ['#FC3551', '#c69347'],
        maestro: ['#1248FF', '#FC3551'],
        discover: ['#F73A67', '#FFC632'],
        jcb: ['#2BB01F', '#FE304A'],
        unionpay: ['#3BC3EE', '#292D98'],
        amex: ['#1238FF', '#E1E1E1'],
        diners: ['#8EB5FF', '#0025CE'],
        invalid: ['#633bbc', '#601111'],
        default: ['#323238', '#323238']
    };

    cardBgColor1.setAttribute('fill', colors[type][0]);
    cardBgColor2.setAttribute('fill', colors[type][1]);

    cardLogo.setAttribute('src', `cc-${type}.${ext ?? 'svg'}`);
    const typeCheck = type && type !== 'default';
    cardLogo.style.opacity = typeCheck ? '1' : '0';
    cardLogo.style.transform = typeCheck ? 'translateY(0)' : 'translateY(-5px)';
};
globalThis.setCardType = setCardType;

// Creating masks
const cardNumber = document.getElementById('card-number');
const cardNumberPattern = {
    mask: [
        {
            mask: '0000 0000 0000 0000',
            regex: /^4\d{0,15}/,
            cardType: 'visa'
        },
        {
            mask: '0000 0000 0000 0000',
            regex: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,
            cardType: 'mastercard',
            ext: 'png'
        },
        {
            mask: '0000 0000 0000 0000',
            regex: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,
            cardType: 'discover',
            ext: 'png'
        },
        {
            mask: '0000 0000 0000 0000',
            regex: /^(?:35\d{0,2})\d{0,12}/,
            cardType: 'jcb',
            ext: 'png'
        },
        {
            mask: '0000 0000 0000 0000',
            regex: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,
            cardType: 'maestro',
            ext: 'png'
        },
        {
            mask: '0000 0000 0000 0000',
            regex: /^62\d{0,14}/,
            cardType: 'unionpay',
            ext: 'png'
        },
        {
            mask: '0000 000000 00000',
            regex: /^3[47]\d{0,13}/,
            cardType: 'amex',
            ext: 'png'
        },
        {
            mask: '0000 000000 0000',
            regex: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,
            cardType: 'diners',
            ext: 'png'
        },
        {
            mask: '0000 0000 0000 0000',
            cardType: 'default'
        }
    ],
    dispatch: (appended, dynamicMasked) => {
        const number = (dynamicMasked.value + appended).replace(/\D/g, '');

        return dynamicMasked.compiledMasks.find(({ regex }) => number.match(regex));
    }
};
const cardNumberMasked = IMask(cardNumber, cardNumberPattern);

const expirationDate = document.getElementById('expiration-date');
const expirationDatePattern = {
    mask: 'MM{/}YY',
    blocks: {
        MM: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12
        },
        YY: {
            mask: IMask.MaskedRange,
            from: parseInt(String(new Date().getFullYear()).slice(2)),
            to: parseInt(String(new Date().getFullYear()).slice(2)) + 10
        }
    }
};
const expirationDateMasked = IMask(expirationDate, expirationDatePattern);

const securityCode = document.getElementById('security-code');
const securityCodeMasked = IMask(securityCode, {
    mask: '000'
});

// Changing card
const cardShowNumber = document.querySelector('.cc-number');
cardNumberMasked.on('accept', () => {
    cardShowNumber.innerText =
        cardNumberMasked.value.length > 0 ? cardNumberMasked.value : '#### #### #### ####';
    setCardType(
        cardNumberMasked.masked.currentMask.cardType,
        cardNumberMasked.masked.currentMask.ext
    );

    if (cardNumberMasked.masked.currentMask.cardType === 'amex') {
        cardNumber.style.borderColor = cardNumberMasked.value.length === 17 ? '#633bbc' : '#323238';
    } else if (cardNumberMasked.masked.currentMask.cardType === 'diners') {
        cardNumber.style.borderColor = cardNumberMasked.value.length === 16 ? '#633bbc' : '#323238';
    } else {
        if (cardNumberMasked.value.length === 19) {
            if (
                cardNumberMasked.masked.currentMask.cardType &&
                cardNumberMasked.masked.currentMask.cardType !== 'default'
            ) {
                cardNumber.style.borderColor = '#633bbc';
            } else {
                cardNumber.style.borderColor = '#601111';
                setCardType('invalid', 'png');
                cardShowNumber.innerText = 'Número Inválido';
            }
        } else {
            cardNumber.style.borderColor = '#323238';
        }
    }
});

const cardName = document.getElementById('card-holder');
const cardShowName = document.querySelector('.cc-holder .value');
cardName.addEventListener('input', () => {
    cardName.value = cardName.value.replace(/[0-9]/g, '');
    cardShowName.innerText = cardName.value.length > 0 ? cardName.value : 'Nome Completo';
    cardName.style.borderColor = cardName.value.match(/[a-zA-Z] [a-zA-Z]/) ? '#633bbc' : '#323238';
});

const cardShowExpirationDate = document.querySelector('.cc-extra .value');
expirationDateMasked.on('accept', () => {
    cardShowExpirationDate.innerText =
        expirationDateMasked.value.length > 0 ? expirationDateMasked.value : '##/##';
    expirationDate.style.borderColor =
        expirationDateMasked.value.length === 5 ? '#633bbc' : '#323238';
});

const cardShowSecurityCode = document.querySelector('.cc-security .value');
securityCodeMasked.on('accept', () => {
    cardShowSecurityCode.innerText =
        securityCodeMasked.value.length > 0 ? securityCodeMasked.value : '###';
    securityCode.style.borderColor = securityCodeMasked.value.length === 3 ? '#633bbc' : '#323238';
});

// form functionality
const inputs = [securityCode, cardName, expirationDate, cardNumber];
const button = document.getElementById('submitButton');
const buttonText = document.querySelector('#submitButton p');
const buttonLoader = document.querySelector('.waveform');
const buttonImg = document.querySelector('#submitButton img');

inputs.forEach(input => {
    // on a input in each input, verify if the color of the actual input and others if green (that is, if it is duly filled) and if all inputs are duly filled, unlock button submit
    input.addEventListener('input', () => {
        const enableButton = inputs.reduce((enable, input) => {
            return enable && input.style.borderColor === 'rgb(99, 59, 188)';
        }, true);

        const isInputEmpty = inputs.reduce((isEmpty, input) => {
            return isEmpty && input.value.length === 0;
        }, true);

        if (enableButton) {
            button.classList.add('activeButton');
            button.disabled = false;

            buttonText.classList.remove('hideButtonElement');
            buttonLoader.classList.add('hideButtonElement');
        } else {
            if (isInputEmpty) {
                buttonLoader.classList.add('hideButtonElement');
                buttonImg.classList.remove('hideButtonElement');
            } else {
                buttonLoader.classList.remove('hideButtonElement');
                buttonImg.classList.add('hideButtonElement');
            }

            button.classList.remove('activeButton');
            button.disabled = true;
            buttonText.classList.add('hideButtonElement');
        }
    });
});

const form = document.querySelector('form');
form.addEventListener('submit', e => {
    e.preventDefault();

    const formLoader = document.querySelector('.orbit');
    const app = document.getElementById('app');

    formLoader.classList.add('showOrbit');
    app.classList.add('appLoadingState');

    setTimeout(async () => {
        let userFirstName = '';
        for (let letter of cardName.value) {
            if (letter === ' ') break;
            else userFirstName += letter;
        }

        // generating card image url
        const cardUrl = await domtoimage.toPng(card);

        // resetting fields
        inputs.forEach(input => {
            input.value = '';
            input.style.borderColor = '#323238';
        });

        cardShowName.innerText = 'NOME COMPLETO';
        cardShowSecurityCode.innerText = '###';
        cardShowNumber.innerText = '#### #### #### ####';
        cardShowExpirationDate.innerText = '##/##';
        setCardType('default');

        buttonText.classList.add('hideButtonElement');
        buttonImg.classList.remove('hideButtonElement');
        button.classList.remove('activeButton');
        button.disabled = true;

        formLoader.classList.remove('showOrbit');
        app.classList.remove('appLoadingState');

        swal({
            title: `Hey ${userFirstName.toLowerCase()}!`,
            text: 'Seu cartão foi gerado com sucesso!',
            icon: 'success',
            content: {
                element: 'img',
                attributes: {
                    src: cardUrl,
                    alt: `${userFirstName.toUpperCase()} GC Card image`
                }
            },
            button: ''
        })
            .then(download => {
                // generating card download link
                if (download) {
                    const cardImgLink = document.createElement('a');
                    cardImgLink.download = `${userFirstName.toUpperCase()}-GC-Card.png`;
                    cardImgLink.href = cardUrl;
                    cardImgLink.click();
                }
            })
            .catch(error => console.error(error));
    }, 1400);
});

// cleaning inputs on load
window.onload = () => {
    cardName.value = '';
    securityCode.value = '';
    cardNumber.value = '';
    expirationDate.value = '';
};
