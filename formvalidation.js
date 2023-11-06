class FormValidation {
    /**
     * Last edited : 03 Nov 2022
     * --------------------------------------------------
     * CONSTRUCTOR
     * --------------------------------------------------
     */
    constructor(params = {}) {
        try {
            this.options = { form: null, formEnclosure: "form-group", lang: "id" }
            for (let prop in this.options) {
                if (params.hasOwnProperty(prop)) {
                    this.options[prop] = params[prop];
                }
            }

            if (!(this.options.form instanceof Element || this.options.form instanceof Document)) {
                this.options.form = document.querySelector(this.options.form);
            }

            //--Check if form is NOT there
            if (!this.options.form)
                throw "Form not found!";

            //--Set validation on form submit by default
            this.options.form.onsubmit = (e) => {
                e.stopPropagation();
                e.preventDefault();

                if (this.validate()) {
                    this.options.form.dispatchEvent(new Event("formvalidated"));
                }
            }

        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Last edited : 03 Nov 2022
     * --------------------------------------------------
     * Validation
     * --------------------------------------------------
     */
    validate() {
        let isValidated = true;

        this.options.form.querySelectorAll("[data-validation-rules]").forEach(el => {
            if (["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) {
                //--Reset message
                this.message(el, "");

                //--Begin validation
                let rules = el.dataset.validationRules.split("|");
                for (let i in rules) {
                    /**
                     * --------------------------------------------------
                     * Rules: Required
                     * --------------------------------------------------
                     * Data wajib diisi
                     */
                    if (rules[i] == "required") {
                        if (!el.value) {
                            this.message(el, this._getMessage('required'));
                            isValidated = false;
                            break;
                        }
                    }
                    /**
                     * --------------------------------------------------
                     * Rules: Minlen
                     * --------------------------------------------------
                     * Minimal jumlah karakter
                     */
                    if (rules[i].startsWith("minlen")) {
                        let minlen = rules[i].split("-");
                        if (el.value.length < minlen[1]) {
                            this.message(el, this._getMessage('minlen', minlen[1]));
                            isValidated = false;
                            break;
                        }
                    }
                    /**
                     * --------------------------------------------------
                     * Rules: Maxlen
                     * --------------------------------------------------
                     * Maksimal jumlah karakter
                     */
                    if (rules[i].startsWith("maxlen")) {
                        let maxlen = rules[i].split("-");
                        if (el.value.length > maxlen[1]) {
                            this.message(el, this._getMessage('maxlen', maxlen[1]));
                            isValidated = false;
                            break;
                        }
                    }
                    /**
                     * --------------------------------------------------
                     * Rules: Charaters ALLOWED
                     * --------------------------------------------------
                     */
                    if (["alpha", "num", "alphanum", "currency"].includes(rules[i])) {
                        let regex = {
                            'alpha': /^[A-Za-z]+$/i,
                            'num': /^[0-9]+$/i,
                            'alphanum': /^[A-Za-z0-9]+$/i,
                            'currency': /^[0-9.,]+$/i,
                        };

                        if (!el.value.match(regex[rules[i]])) {
                            this.message(el, this._getMessage(rules[i]));
                            isValidated = false;
                            break;
                        }
                    }
                    /**
                     * --------------------------------------------------
                     * Rules: Match With
                     * --------------------------------------------------
                     */
                    if (rules[i].startsWith("passmatch")) {
                        let targetEl = this.options.form.querySelector(`#${rules[i].split("-")[1]}`);
                        if (el.value !== targetEl.value) {
                            this.message(el, this._getMessage('passmatch'));
                            isValidated = false;
                            break;
                        }
                    }
                }
            }
        });

        return isValidated;
    }

    /**
     * Last edited : 03 Nov 2022
     * --------------------------------------------------
     * Display Message
     * --------------------------------------------------
     */
    message(el, message = "") {
        try {
            let parentEl = el.closest(`.${this.options.formEnclosure}`);
            //--Check if form enclosure is there
            if (!parentEl)
                throw "Form enclosure not found!";

            //--Check if message class is there
            if (!parentEl.querySelector("._validationMessage")) {
                parentEl.insertAdjacentHTML("beforeend", "<small class='_validationMessage' style='display:block;color:red;margin-top:3px'></small>")
            }

            parentEl.querySelector("._validationMessage").innerHTML = message;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Last edited : 03 Nov 2022
     * --------------------------------------------------
     * Clear Display Message
     * --------------------------------------------------
     */
    clear() {
        this.options.form.querySelectorAll("._validationMessage").forEach(el => el.innerHTML = '');
    }

    /**
     * Last edited : 03 Nov 2022
     * --------------------------------------------------
     * Message LANG
     * --------------------------------------------------
     */
    _getMessage(type, $1) {
        try {
            return {
                'required': {
                    'id': 'Isian tidak boleh kosong',
                    'en': 'This field is required',
                },
                'minlen': {
                    'id': `Minimal isian harus ${$1} karakter`,
                    'en': `The input must be at least ${$1} character(s)`,
                },
                'maxlen': {
                    'id': `Maksimal isian tak lebih dari ${$1} karakter`,
                    'en': `The input must be no more than ${$1} character(s)`,
                },
                'alpha': {
                    'id': 'Karakter yang diperbolehkan hanya huruf',
                    'en': 'The only characters allowed are letters',
                },
                'num': {
                    'id': 'Karakter yang diperbolehkan hanya angka',
                    'en': 'The only characters allowed are numbers',
                },
                'alphanum': {
                    'id': 'Karakter yang diperbolehkan hanya huruf dan angka',
                    'en': 'The only characters allowed are letters and numbers',
                },
                'currency': {
                    'id': 'Karakter yang diperbolehkan hanya angka, titik dan koma',
                    'en': 'The only characters allowed are numbers, perriod and comma',
                },
                'passmatch': {
                    'id': 'Kata sandi tidak sama',
                    'en': 'The password doesn\'t match',
                },
            }[type][this.options.lang];
        } catch (err) {
            return "Error message is not defined!";
        }
    }
}