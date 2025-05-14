// Aside Navigation
function asideNavElements() {
    if ($('.aside__nav').length) {
        var asideNav = $('.aside__nav'),
            asideNavLink = asideNav.find('.aside__navLink:not(:only-child)');
        asideNavLink.each(function () {
            $(this).on('click', function (event) {
                var asideNavSubLists = $(this).next('.aside__navSubList'),
                    asideNavSubListSiblings = asideNavLink
                        .not(this)
                        .next('.aside__navSubList');

                $(this).toggleClass('is-active');
                asideNavLink.not(this).removeClass('is-active');
                asideNavSubLists.stop().slideToggle(350);
                asideNavSubListSiblings.slideUp(350);
                event.preventDefault();
            });
        });
    }
}

// MDI Popup
function mdiPopupOpen() {
    $('.modalPopup__mask').fadeIn(300);
    $('#mdiPop').fadeIn(500);
    $('html').addClass('is-overflowHidden');
}

function mdiPopupClose() {
    $('.modalPopup__mask').hide();
    $('#mdiPop').hide();
    $('html').removeClass('is-overflowHidden');
}

// Modal Popup
function modalPopupOpen(el) {
    $('.modalPopup__mask').fadeIn(300);
    $(el).css('z-index', 9992);
    $(el).fadeIn(500);
    $('html').addClass('is-overflowHidden');
}

function modalPopupClose(el) {
    $('.modalPopup__mask').hide();
    $(el).hide();
    $('html').removeClass('is-overflowHidden');
}

// Modal Popup Inside
function modalPopupInsideOpen(el) {
    $('.modalPopup__maskInside').fadeIn(300);
    $(el).css('z-index', 9999);
    $(el).fadeIn(500);
}

function modalPopupInsideClose(el) {
    $('.modalPopup__maskInside').hide();
    $(el).hide();
}

// MDI Dropdown
function mdiDropdownOpener() {
    document.querySelector('.mdi__btn').addEventListener('click', function () {
        this.parentNode.classList.toggle('is-active');
    });
}

function mdiDropdownCloser() {
    document.addEventListener('click', function (event) {
        let mdiDropdown = document.querySelector('.mdi__dropdown');
        let mdiDropDownActive = mdiDropdown.classList.contains('is-active');
        if (!event.target.matches('.mdi__btn') && mdiDropDownActive) {
            mdiDropdown.classList.remove('is-active');
        }
    });
}

// Entity Validation
class ValidationError extends Error {
    constructor(...parameters) {
        super(...parameters);

        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }
    }
}

async function getEntityRuleset(basePath) {
    return await $.ajax({
        url: basePath + '/entities',
        type: 'GET'
    });
}

function validateEntityObjectRecursive(object, entityRuleset) {
    recursive(object);

    function recursive(object) {
        if(object !== null && typeof object === 'object') {
            if(object.hasOwnProperty('_entity')) {
                validateEntityObject(object, object._entity, entityRuleset);
            }

            Object.keys(object).map(i => recursive(object[i]));
        }
    }
}

function validateEntityObject(object, entityName, entityRuleset) {
    const entityRules = entityRuleset.entityRuleList.filter(entityRule => entityRule.entityName === entityName);

    if(entityRules.length !== 1) {
        throw new Error('올바르지 않는 Entity 이름입니다.');
    }

    const entityRule = entityRules[0];

    for(let i in entityRule.propertyRuleList) {
        const propertyRule = entityRule.propertyRuleList[i];
        const propertyRuleSegments = propertyRule.propertyRule.split('|__seperator__|');
        const propertyAlias = propertyRule.propertyAlias;
        const propertyValue = object[propertyRule.propertyName];

        for(let j in propertyRuleSegments) {
            const propertyRuleSegment = propertyRuleSegments[j];
            const [ propertyRuleType, propertyRuleArguments ] = propertyRuleSegment.split(':__delimiter__:');
            const propertyRuleArgument = propertyRuleArguments ? propertyRuleArguments.split(',') : [];

            switch(propertyRuleType) {
                case 'assertfalse':
                    if(!(_isNull(propertyValue) || _isFalse(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'의 값이 참입니다.`);
                    }
                    break;

                case 'asserttrue':
                    if(!(_isNull(propertyValue) || _isTrue(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'의 값이 거짓입니다.`);
                    }
                    break;

                case 'decimalmax':
                    propertyRuleArgument[0] = parseFloat(propertyRuleArgument[0]);
                    propertyRuleArgument[1] = propertyRuleArgument[1] === 'true';

                    if(!(_isNaN(propertyValue) || _isDecimalMax(propertyValue, propertyRuleArgument[0], propertyRuleArgument[1]))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) '${_formatNumber(propertyRuleArgument[0])}' 보다 작아야 합니다.`);
                    }
                    break;

                case 'decimalmin':
                    propertyRuleArgument[0] = parseFloat(propertyRuleArgument[0]);
                    propertyRuleArgument[1] = propertyRuleArgument[1] === 'true';

                    if(!(_isNaN(propertyValue) || _isDecimalMin(propertyValue, propertyRuleArgument[0], propertyRuleArgument[1]))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) '${_formatNumber(propertyRuleArgument[0])}' 보다 커야 합니다.`);
                    }
                    break;

                case 'digits':
                    console.warn(`'${propertyAlias}'의 숫자 자리수 검사 기능은 지원하지 않습니다.`);
                    break;

                case 'size':
                    propertyRuleArgument[0] = parseInt(propertyRuleArgument[0]);
                    propertyRuleArgument[1] = parseInt(propertyRuleArgument[1]);

                    if(!(_isNull(propertyValue) || _isSize(propertyValue, propertyRuleArgument[0], propertyRuleArgument[1]))) {
                        throw new ValidationError(`'${propertyAlias}'의 길이는 '${propertyRuleArgument[0]}' ~ '${propertyRuleArgument[1]}' 사이이어야 합니다.`);
                    }
                    break;

                case 'email':
                    propertyRuleArgument[1] = parseInt(propertyRuleArgument[1]);
                    propertyRuleArgument[1] = _resolvePatternFlag(propertyRuleArgument[1]);

                    if(!(_isNull(propertyValue) || _isPattern(propertyValue, propertyRuleArgument[0], propertyRuleArgument[1]))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 이메일 형식이어야 합니다.`);
                    }
                    break;

                case 'pattern':
                    propertyRuleArgument[1] = parseInt(propertyRuleArgument[1]);
                    propertyRuleArgument[1] = _resolvePatternFlag(propertyRuleArgument[1]);

                    if(!(_isNull(propertyValue) || _isPattern(propertyValue, propertyRuleArgument[0], propertyRuleArgument[1]))) {
                        throw new ValidationError(`'${propertyAlias}'이(가) 형식에 맞지 않습니다.`);
                    }
                    break;

                case 'future':
                    if(!(_isNull(propertyValue) || _isFuture(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 현재 시간보다 이후이어야 합니다.`);
                    }
                    break;

                case 'futureorpresent':
                    if(!(_isNull(propertyValue) || _isFutureOrPresent(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 현재 시간과 같거나 이후이어야 합니다.`);
                    }
                    break;

                case 'past':
                    if(!(_isNull(propertyValue) || _isPast(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 현재 시간보다 이전이어야 합니다.`);
                    }
                    break;

                case 'pastorpresent':
                    if(!(_isNull(propertyValue) || _isPastOrPresent(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 현재 시간과 같거나 이전이어야 합니다.`);
                    }
                    break;

                case 'max':
                    propertyRuleArgument[0] = parseFloat(propertyRuleArgument[0]);

                    if(!(_isNaN(propertyValue) || _isMax(propertyValue, propertyRuleArgument[0]))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) '${_formatNumber(propertyRuleArgument[0])}' 보다 같거나 작아야 합니다.`);
                    }
                    break;

                case 'min':
                    propertyRuleArgument[0] = parseFloat(propertyRuleArgument[0]);

                    if(!(_isNaN(propertyValue) || _isMin(propertyValue, propertyRuleArgument[0]))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) '${_formatNumber(propertyRuleArgument[0])}' 보다 같거나 커야 합니다.`);
                    }
                    break;

                case 'negative':
                    if(!(_isNaN(propertyValue) || _isNegative(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 음수이어야 합니다.`);
                    }
                    break;

                case 'negativeorzero':
                    if(!(_isNaN(propertyValue) || _isNegativeOrZero(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 음수 또는 '0'이어야 합니다.`);
                    }
                    break;

                case 'positive':
                    if(!(_isNaN(propertyValue) || _isPositive(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 양수이어야 합니다.`);
                    }
                    break;

                case 'positiveorzero':
                    if(!(_isNaN(propertyValue) || _isPositiveOrZero(propertyValue))) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 양수 또는 '0'이어야 합니다.`);
                    }
                    break;

                case 'notblank':
                    if(!_isNotBlank(propertyValue)) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 비어있는 문자열일 수 없습니다.`);
                    }
                    break;

                case 'notempty':
                    if(!_isNotEmpty(propertyValue)) {
                        throw new ValidationError(`'${propertyAlias}'은(는) 빈 값일 수 없습니다.`);
                    }
                    break;

                case 'notnull':
                    if(!_isNotNull(propertyValue)) {
                        throw new ValidationError(`'${propertyAlias}'은(는) Null 값일 수 없습니다.`);
                    }
                    break;

                case 'null':
                    if(!_isNull(propertyValue)) {
                        throw new ValidationError(`'${propertyAlias}'은(는) Null 값이어야 합니다.`);
                    }
                    break;

                default: break;
            }
        }
    }

    function _resolvePatternFlag(patternFlag) {
        let flag = '';

        if(patternFlag & 2) flag += 'i';
        if(patternFlag & 8) flag += 'm';
        if(patternFlag & 32) flag += 's';
        if(patternFlag & 64) flag += 'u';

        return flag;
    }

    // 원시 타입 비교 함수
    function _isFalse(boolean) {
        return boolean === false;
    }

    function _isTrue(boolean) {
        return boolean === true;
    }

    function _isNumber(number) {
        return typeof number === 'number' && !_isNaN(number);
    }

    function _isString(string) {
        return typeof string === 'string';
    }

    function _isObject(object) {
        return typeof object === 'object' && !_isNull(object);
    }

    function _isDate(date) {
        return date instanceof Date;
    }

    function _isNull(object) {
        return object === null || object === undefined;
    }

    function _isNaN(number) {
        return _isNull(number) || !isFinite(number) || isNaN(number);
    }

    // JSR-303, JSR-380 표준 비교 함수
    function _isDecimalMax(decimal, max, inclusive) {
        return _isNumber(decimal) && inclusive ? decimal >= max : decimal > max;
    }

    function _isDecimalMin(decimal, min, inclusive) {
        return _isNumber(decimal) && inclusive ? decimal <= min : decimal < min;
    }

    function _isMax(number, max) {
        return _isNumber(number) && number <= max;
    }

    function _isMin(number, min) {
        return _isNumber(number) && number >= min;
    }

    function _isNegative(number) {
        return _isNumber(number) && number < 0;
    }

    function _isNegativeOrZero(number) {
        return _isNumber(number) && number <= 0;
    }

    function _isPositive(number) {
        return _isNumber(number) && number > 0;
    }

    function _isPositiveOrZero(number) {
        return _isNumber(number) && number >= 0;
    }

    function _isSize(object, min, max) {
        return (_isString(object) && object.length >= min && object.length <= max)
            || (_isObject(object) && Object.keys(object).length >= min && Object.keys(object).length <= max);
    }

    function _isPattern(string, regex, flag) {
        return _isString(string) && new RegExp(regex, flag).test(string);
    }

    function _isFuture(date) {
        return _isDate(date) && date > new Date();
    }

    function _isFutureOrPresent(date) {
        return _isDate(date) && date >= new Date();
    }

    function _isPast(date) {
        return _isDate(date) && date < new Date();
    }

    function _isPastOrPresent(date) {
        return _isDate(date) && date <= new Date();
    }

    function _isNotBlank(string) {
        return _isString(string) && string.trim() !== '';
    }

    function _isNotEmpty(object) {
        return (_isString(object) && object.trim() !== '')
            || (_isObject(object) && Object.keys(object).length > 0);
    }

    function _isNotNull(object) {
        return !(_isNull(object) || (typeof object === 'number' && !_isNumber(object)));
    }
}

// On app mounted
window.onAppMounted = () => {
    asideNavElements();
    mdiDropdownOpener();
    mdiDropdownCloser();
};
