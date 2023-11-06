const app = (function () {
    /**
     * --------------------------------------------------
     * HELPERS: Debounce
     * --------------------------------------------------
     */
    let debounce = (func, timeout = 500) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    };

    /**
    * Last edited : xx XXX xx
    * --------------------------------------------------
    * Init
    * --------------------------------------------------
    */
    const formatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
    getAll("input[type=date]").forEach((el) => {
        el.onfocus = (e) => el.showPicker();
        el.onclick = (e) => el.showPicker();
    });

    /**
    * Last edited : xx XXX xx
    * --------------------------------------------------
    * Init re-usable Alpine data
    * --------------------------------------------------
    */
    document.addEventListener("alpine:init", () => {
        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Dropdown
        * --------------------------------------------------
        */
        Alpine.data("dropdown", () => ({
            dropdownOpen: false,
            toggleDropdown() {
                this.dropdownOpen = !this.dropdownOpen;
            },
        }));

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Collpase
        * --------------------------------------------------
        */
        Alpine.data("collapse", () => ({
            collapseOpen: false,
            toggleCollapse() {
                this.collapseOpen = !this.collapseOpen;
            },
        }));

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Modal
        * --------------------------------------------------
        */
        Alpine.data("modal", (append) => ({
            modalOpen: false,
            is_loading: false,
            alert: '',
            init() {
                this.$watch('modalOpen', (value) => {
                    if (!value) {
                        this.alert = '';
                        this.is_loading = false;
                        this.$dispatch('modal-close');
                    }
                });
            },
            ...append
        }));

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Lazyload
        * --------------------------------------------------
        */
        Alpine.data("lazyload", (url) => ({
            data: [],
            page: 1,
            limit: 10,
            isLoading: false,
            getData() {
                this.isLoading = true;
                fetch(`${url}?page=${this.page++}&limit=${this.limit}`).then((res) => res.json()).then((data) => {
                    for (i in data) {
                        this.data.push(data[i]);
                    }
                    this.isLoading = false;
                });
            },
        }));

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Table
        * --------------------------------------------------
        */
        Alpine.data("table", (url, append = {}) => ({
            data: [],
            page: 1,
            limit: 10,
            sort: "",
            totalData: 0,
            params: {},
            pagination: { first: 0, last: 0, active: 0, pages: [] },
            isLoading: false,
            getData() {
                this.isLoading = true;
                fetch(`${url}?page=${this.page}&limit=${this.limit}&sort=${this.sort}&${new URLSearchParams(this.params).toString()}`).then((res) => res.json()).then((res) => {
                    this.data = res.data;
                    this.totalData = res.total_data;

                    //--Generate pagination
                    if (this.totalData > 0) {
                        this.pagination.first = 1;
                        this.pagination.last = Math.ceil(this.totalData / this.limit);

                        let totalPage = Math.ceil(this.totalData / this.limit);
                        this.pagination.pages[0] = (totalPage > 0 && this.page == 1) || totalPage < 3 ? 1 : this.page > 1 && this.page < totalPage ? this.page - 1 : this.page - 2;

                        this.pagination.pages[1] = totalPage < 2 ? 0 : this.page < 2 ? 2 : this.page < totalPage ? this.page : this.page - 1;
                        this.pagination.pages[2] = totalPage < 3 ? 0 : this.page < 3 ? 3 : this.page < totalPage ? this.page + 1 : this.page;
                    }

                    this.isLoading = false;
                    // For debugging purposes
                    // console.log("run once....");
                });
            },
            ...append
        }));
    });

    return {
        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Debounce
        * --------------------------------------------------
        */
        debounce: this.debounce,

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Show Message
        * --------------------------------------------------
        */
        message: (text = "", duration = 4000) => {
            Toastify({
                text: `<i class='bi-bell-fill text-2xl text-blue-900 mr-4 animate-pulse'></i>${text}`,
                duration: duration,
                escapeMarkup: false,
                className: "w-80 py-3 text-sm leading-tight bg-none !bg-white !text-inherit rounded-md shadow-lg border border-gray-200 flex items-center",
            }).showToast();
        },

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Show Confirm Dialog
        * --------------------------------------------------
        */
        confirm: (params = {}) => {
            // set default setting
            let options = {
                title: "Apakah anda yakin?",
                message: "Aksi ini tidak dapat diurungkan",
                icon: "warning",
                confirmText: "Ya, lanjutkan!",
                cancelText: "Batalkan",
                confirmColor: "danger",
                cancelColor: "secondary",
                callback: () => { },
                callbackCancel: () => { }
            }

            let colors = { primary: "#0b51b7", secondary: "#7081b9", danger: "#ef4d56" };
            // extend default settings from param
            for (let prop in options) {
                if (params.hasOwnProperty(prop)) {
                    options[prop] = params[prop];
                }
            }

            // show dialog
            Swal.fire({
                title: options.title,
                text: options.message,
                icon: options.icon,
                showCancelButton: true,
                confirmButtonColor: colors[options.confirmColor],
                confirmButtonText: options.confirmText,
                cancelButtonColor: colors[options.cancelColor],
                cancelButtonText: options.cancelText
            }).then((result) => {
                if (result.isConfirmed) {
                    options.callback();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    options.callbackCancel();
                }
            });
        },

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Conver FormData to URLParams
        * --------------------------------------------------
        */
        formToObject: (formEl, obj = {}) => {
            let object = obj;
            let formData = new FormData(formEl);
            formData.forEach((value, key) => (object[key] = value));
            return object;
        },

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Set menu active (PENDING!)
        * --------------------------------------------------
        */
        setActiveMenu: (menuID) => { },

        /**
        * Last edited : xx XXX xx
        * --------------------------------------------------
        * Convert angka ke format Rupiah
        * --------------------------------------------------
        */
        toRupiah: (str, withSymbol = true) => withSymbol ? formatter.format(str) : (formatter.format(str)).replace(/(Rp)/, "").trim(),

        /**
         * Last edited : 03 Nov 2022
         * --------------------------------------------------
         * Convert currency to number
         * --------------------------------------------------
         */
        toNumber: (str) => Number(str.replace(/[^0-9,-]+/g, "").replace(/[,]+/g, ".")),

        /**
         * Last edited : 03 Nov 2022
         * --------------------------------------------------
         * Set form value
         * --------------------------------------------------
         */
        setForm: (formEl, data) => {
            let el;
            for (key in data) {
                el = formEl.querySelector(`[name=${key}]`);
                if (el) {
                    if (el.tagName === "INPUT" && ["checkbox", "radio"].includes(el.type)) {
                        el = formEl.querySelector(`[name=${key}][value=${data[key]}]`);
                        if (el)
                            el.checked = true;
                    } else {
                        el.value = data[key];
                    }
                }
            }
        },

        /**
         * Last edited : 03 Nov 2022
         * --------------------------------------------------
         * Slim Search
         * --------------------------------------------------
         */
        slimSearch: (url = '', csrf = '') => {
            let searchURL = url;
            return (search, currentData) => {
                return new Promise((resolve, reject) => {
                    if (search.length < 2) {
                        return reject('Kata kunci minimal 2 karakter')
                    }

                    fetch(searchURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf
                        },
                        body: JSON.stringify({ search: search })
                    }).then(r => r.json()).then(data => {
                        const options = data
                            .filter((d) => { return !currentData.some((od) => { return od.value === d.value }) })
                            .map(d => { return { text: d.text, value: d.value } });
                        resolve(options);
                    });
                });
            }
        }
    };
})();
