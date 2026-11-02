let activeConfig = null;

$(function () {
    window.addEventListener("message", function (event) {
        var _ = event.data;

        if (_.nuiType === "input") {
            if (_.inputAction === "open") {
                activeConfig = _;
                renderInputModal(_);
            } else if (_.inputAction === "close") {
                closeInputModal(false);
            }
        }
    });

    $(document).on("keydown", function (e) {
        if (!activeConfig) return;
        if (e.key === "Escape") {
            closeInputModal(true);
        } else if (e.key === "Enter" && !$("textarea").is(":focus")) {
            e.preventDefault();
            submitInputModal();
        }
    });
});

function renderInputModal(_) {
    const gameName = _.gameName || "fivem";
    const modalWidth = _.width || "md"; // sm, md, lg, xl
    const confirmText = (_.messages && _.messages.confirm) ? _.messages.confirm : "Confirmar";
    const cancelText = (_.messages && _.messages.cancel) ? _.messages.cancel : "Cancelar";

    let fieldsHtml = "";

    (_.inputs || []).forEach((field, index) => {
        const fieldId = field.id || `input_field_${index}`;
        const sizeClass = `size-${field.size || "100"}`; // 25, 33, 50, 75, 100
        const reqStar = field.required ? `<span class="requiredStar">*</span>` : "";
        const descHtml = field.description ? `<div class="inputDescription">${field.description}</div>` : "";
        const labelHtml = field.label ? `<label class="inputLabel" for="${fieldId}"><span>${field.label}${reqStar}</span></label>` : "";

        let controlHtml = "";

        switch (field.type) {
            case "text":
            case "number":
            case "date":
            case "time":
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <input 
                        type="${field.type}" 
                        id="${fieldId}" 
                        class="inputControl" 
                        placeholder="${field.placeholder || ""}" 
                        value="${field.default !== undefined ? field.default : ""}"
                        ${field.min !== undefined ? `min="${field.min}"` : ""} ${field.max !== undefined ? `max="${field.max}"` : ""}
                        ${field.step !== undefined ? `step="${field.step}"` : ""} ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
                    />
                `;
                break;

            case "password":
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="fieldWrapper">
                        <input 
                            type="password" 
                            id="${fieldId}" 
                            class="inputControl" 
                            placeholder="${field.placeholder || "••••••••"}" 
                            value="${field.default || ""}"
                            ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
                        />
                        <button type="button" class="togglePasswordBtn" data-target="${fieldId}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                    </div>
                `;
                break;

            case "textarea":
                const maxLen = field.maxLength || 500;
                const initVal = field.default || "";
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <textarea 
                        id="${fieldId}" 
                        class="textareaControl" 
                        placeholder="${field.placeholder || ""}" 
                        maxlength="${maxLen}"
                        rows="${field.rows || 3}"
                    >${initVal}</textarea>
                    <div class="charCounter"><span id="count_${fieldId}">${initVal.length}</span> / ${maxLen}</div>
                `;
                break;

            case "select":
                let optionsHtml = "";
                (field.options || []).forEach(opt => {
                    const isSelected = (field.default !== undefined && String(field.default) === String(opt.value)) ? "selected" : "";
                    optionsHtml += `<option value="${opt.value}" ${isSelected}>${opt.label}</option>`;
                });
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <select id="${fieldId}" class="selectControl">
                        ${optionsHtml}
                    </select>
                `;
                break;

            case "range":
                const minVal = field.min !== undefined ? field.min : 0;
                const maxVal = field.max !== undefined ? field.max : 100;
                const stepVal = field.step !== undefined ? field.step : 1;
                const curVal = field.default !== undefined ? field.default : minVal;
                const unit = field.unit || "";
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="rangeWrapper">
                        <input 
                            type="range" 
                            id="${fieldId}" 
                            class="rangeControl" 
                            min="${minVal}" 
                            max="${maxVal}" 
                            step="${stepVal}" 
                            value="${curVal}"
                            data-unit="${unit}"
                        />
                        <span class="rangeValueBadge" id="val_${fieldId}">${curVal}${unit}</span>
                    </div>
                `;
                break;

            case "color":
            case "rgb":
                const defaultHex = formatHex(field.default || "#1FA5DE");
                const rgbObj = hexToRgb(defaultHex);
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="colorWrapper" id="wrap_${fieldId}">
                        <div class="colorSwatchBox">
                            <input type="color" id="${fieldId}" class="colorPickerNative" value="${defaultHex}" />
                        </div>
                        <input type="text" id="hex_${fieldId}" class="colorHexInput" value="${defaultHex}" maxlength="7" />
                        <div class="rgbInputsContainer">
                            <div class="rgbSingleBox">
                                <span class="r-label">R</span>
                                <input type="number" id="r_${fieldId}" class="rgbNumberInput" min="0" max="255" value="${rgbObj.r}" data-parent="${fieldId}" />
                            </div>
                            <div class="rgbSingleBox">
                                <span class="g-label">G</span>
                                <input type="number" id="g_${fieldId}" class="rgbNumberInput" min="0" max="255" value="${rgbObj.g}" data-parent="${fieldId}" />
                            </div>
                            <div class="rgbSingleBox">
                                <span class="b-label">B</span>
                                <input type="number" id="b_${fieldId}" class="rgbNumberInput" min="0" max="255" value="${rgbObj.b}" data-parent="${fieldId}" />
                            </div>
                        </div>
                    </div>
                `;
                break;

            case "checkbox":
                let checksHtml = "";
                (field.options || []).forEach((opt, idx) => {
                    const checked = (Array.isArray(field.default) && field.default.includes(opt.value)) || opt.checked ? "checked" : "";
                    checksHtml += `
                        <label class="optionLabel">
                            <input type="checkbox" class="hiddenInput" name="${fieldId}" value="${opt.value}" ${checked} />
                            <span class="customCheck"></span>
                            <span>${opt.label}</span>
                        </label>
                    `;
                });
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="optionsList">${checksHtml}</div>
                `;
                break;

            case "radio":
                let radiosHtml = "";
                (field.options || []).forEach((opt, idx) => {
                    const checked = (field.default !== undefined && String(field.default) === String(opt.value)) || (idx === 0 && field.default === undefined) ? "checked" : "";
                    radiosHtml += `
                        <label class="optionLabel">
                            <input type="radio" class="hiddenInput" name="${fieldId}" value="${opt.value}" ${checked} />
                            <span class="customRadio"></span>
                            <span>${opt.label}</span>
                        </label>
                    `;
                });
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="optionsList">${radiosHtml}</div>
                `;
                break;

            case "switch":
                const isChecked = field.default === true ? "checked" : "";
                controlHtml = `
                    ${labelHtml}
                    <label class="switchRow" for="${fieldId}">
                        <span style="color: rgba(255,255,255,0.8); font-size: 0.68vw;">${field.placeholder || field.description || "Ativar opção"}</span>
                        <input type="checkbox" id="${fieldId}" class="hiddenInput" ${isChecked} />
                        <div class="switchTrack"><div class="switchThumb"></div></div>
                    </label>
                `;
                break;
        }

        fieldsHtml += `
            <div class="inputGroup ${sizeClass}" data-field-id="${fieldId}" data-type="${field.type}" data-required="${field.required ? 'true' : 'false'}">
                ${controlHtml}
            </div>
        `;
    });

    $("#nuiInput").html(`
        <div id="${gameName}">
            <div class="inputModal modal-${modalWidth}">
                <div class="modalHeader">
                    <div class="modalTitle">${_.title || "Formulário de Entrada"}</div>
                    ${_.subtitle ? `<div class="modalSubtitle">${_.subtitle}</div>` : ""}
                </div>

                <div class="modalBody">
                    ${fieldsHtml}
                </div>

                <div class="modalFooter">
                    <button type="button" class="btnModal btnCancel" id="btnInputCancel">${cancelText}</button>
                    <button type="button" class="btnModal btnConfirm" id="btnInputConfirm">${confirmText}</button>
                </div>
            </div>
        </div>
    `);

    $("#nuiInput").css("display", "block");
    bindInputEvents();
}

function bindInputEvents() {
    // Mostrar / Ocultar Senha
    $(".togglePasswordBtn").on("click", function () {
        const targetId = $(this).data("target");
        const input = $(`#${targetId}`);
        const isPass = input.attr("type") === "password";
        input.attr("type", isPass ? "text" : "password");
    });

    // Contador de caracteres do Textarea
    $(".textareaControl").on("input", function () {
        const id = $(this).attr("id");
        $(`#count_${id}`).text($(this).val().length);
    });

    // Atualização do Range Slider
    $(".rangeControl").on("input", function () {
        const id = $(this).attr("id");
        const unit = $(this).data("unit") || "";
        $(`#val_${id}`).text(`${$(this).val()}${unit}`);
    });

    // Sincronização Color Picker -> HEX & RGB
    $(".colorPickerNative").on("input", function () {
        const id = $(this).attr("id");
        const hex = $(this).val().toUpperCase();
        const rgb = hexToRgb(hex);

        $(`#hex_${id}`).val(hex);
        $(`#r_${id}`).val(rgb.r);
        $(`#g_${id}`).val(rgb.g);
        $(`#b_${id}`).val(rgb.b);
    });

    // Sincronização HEX -> Color Picker & RGB
    $(".colorHexInput").on("input", function () {
        const id = $(this).attr("id").replace("hex_", "");
        let val = $(this).val();
        if (!val.startsWith("#")) val = "#" + val;

        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            const rgb = hexToRgb(val);
            $(`#${id}`).val(val);
            $(`#r_${id}`).val(rgb.r);
            $(`#g_${id}`).val(rgb.g);
            $(`#b_${id}`).val(rgb.b);
        }
    });

    // Sincronização Inputs R, G, B -> Color Picker & HEX
    $(".rgbNumberInput").on("input", function () {
        const parentId = $(this).data("parent");
        let r = clampRgb($(`#r_${parentId}`).val());
        let g = clampRgb($(`#g_${parentId}`).val());
        let b = clampRgb($(`#b_${parentId}`).val());

        const hex = rgbToHex(r, g, b);
        $(`#${parentId}`).val(hex);
        $(`#hex_${parentId}`).val(hex);
    });

    // Remover erro ao digitar
    $(".inputControl, .textareaControl, .selectControl").on("input change", function () {
        $(this).closest(".inputGroup").removeClass("has-error");
    });

    // Botões de Ação
    $("#btnInputCancel").on("click", function () {
        closeInputModal(true);
    });

    $("#btnInputConfirm").on("click", function () {
        submitInputModal();
    });
}

function submitInputModal() {
    if (!activeConfig) return;

    let hasError = false;
    let results = {};

    (activeConfig.inputs || []).forEach((field, index) => {
        const fieldId = field.id || `input_field_${index}`;
        const groupEl = $(`.inputGroup[data-field-id="${fieldId}"]`);
        let value = null;

        switch (field.type) {
            case "text":
            case "password":
            case "textarea":
            case "date":
            case "time":
            case "select":
                value = $(`#${fieldId}`).val();
                if (field.required && (!value || String(value).trim() === "")) {
                    hasError = true;
                    groupEl.addClass("has-error");
                }
                break;

            case "number":
            case "range":
                const rawNum = $(`#${fieldId}`).val();
                if (field.required && (rawNum === "" || isNaN(Number(rawNum)))) {
                    hasError = true;
                    groupEl.addClass("has-error");
                }
                value = rawNum !== "" ? Number(rawNum) : null;
                break;

            case "color":
            case "rgb":
                const hexVal = $(`#${fieldId}`).val().toUpperCase();
                const r = clampRgb($(`#r_${fieldId}`).val());
                const g = clampRgb($(`#g_${fieldId}`).val());
                const b = clampRgb($(`#b_${fieldId}`).val());
                value = {
                    hex: hexVal,
                    rgb: { r, g, b },
                    rgbString: `${r}, ${g}, ${b}`
                };
                break;

            case "checkbox":
                let selectedChecks = [];
                $(`input[name="${fieldId}"]:checked`).each(function () {
                    selectedChecks.push($(this).val());
                });
                if (field.required && selectedChecks.length === 0) {
                    hasError = true;
                    groupEl.addClass("has-error");
                }
                value = selectedChecks;
                break;

            case "radio":
                value = $(`input[name="${fieldId}"]:checked`).val() || null;
                if (field.required && !value) {
                    hasError = true;
                    groupEl.addClass("has-error");
                }
                break;

            case "switch":
                value = $(`#${fieldId}`).is(":checked");
                break;
        }

        results[fieldId] = value;
    });

    if (hasError) return;

    const resourceName = activeConfig.resourceName || (window.GetParentResourceName ? GetParentResourceName() : "striata_input");
    const callbackEndpoint = activeConfig.callback || "inputResult";

    $.post(`https://${resourceName}/${callbackEndpoint}`, JSON.stringify({
        action: "confirm",
        values: results
    }));

    closeInputModal(false);
}

function closeInputModal(sendCancelCallback) {
    if (sendCancelCallback && activeConfig) {
        const resourceName = activeConfig.resourceName || (window.GetParentResourceName ? GetParentResourceName() : "striata_input");
        const callbackEndpoint = activeConfig.callback || "inputResult";

        $.post(`https://${resourceName}/${callbackEndpoint}`, JSON.stringify({
            action: "cancel",
            values: null
        }));
    }

    activeConfig = null;
    $("#nuiInput").html("");
    $("#nuiInput").css("display", "none");
}

/* Funções Utilitárias de Conversão RGB / HEX */
function clampRgb(val) {
    let n = parseInt(val, 10);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(255, n));
}

function formatHex(hex) {
    if (!hex || typeof hex !== "string") return "#1FA5DE";
    return hex.startsWith("#") ? hex : `#${hex}`;
}

function hexToRgb(hex) {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    if (isNaN(bigint)) return { r: 31, g: 165, b: 222 };
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
}

// ============================================================================
// MODO DE TESTE PARA NAVEGADOR (LIVE SERVER)
// ============================================================================
$(function () {
    // Se 'GetParentResourceName' não existir, significa que estamos no navegador e não no FiveM
    if (!window.invokeNative) {
        
        // Fundo falso de jogo só para enxergar o efeito de blur (vidro) no navegador
        $("body").css({
            "background-image": "url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1920&auto=format&fit=crop')",
            "background-size": "cover",
            "background-position": "center",
            "margin": "0",
            "overflow": "hidden"
        });

        // Simula o SendNUIMessage do Lua
        window.postMessage({
            nuiType: "input",
            inputAction: "open",
            gameName: "fivem", // Troque para "redm" se quiser testar o tema RedM
            width: "lg",       // Teste "sm", "md", "lg", "xl"
            title: "Painel de Configuração",
            subtitle: "Visualização em tempo real pelo Live Server",
            messages: {
                confirm: "Confirmar",
                cancel: "Cancelar"
            },
            inputs: [
                { id: "nome", type: "text", label: "Nome da Organização", placeholder: "Ex: Mecânica Sul", size: "50", required: true },
                { id: "senha", type: "password", label: "PIN do Cofre", default: "1234", size: "50", required: true },
                
                { id: "vagas", type: "number", label: "Limite de Membros", default: 25, min: 1, max: 100, size: "25", required: true },
                { id: "categoria", type: "select", label: "Tipo de Setor", size: "50", default: "ilegal", options: [
                    { label: "Legal / Empresa", value: "legal" },
                    { label: "Organização Ilegal", value: "ilegal" },
                    { label: "Governamental / Polícia", value: "gov" }
                ]},
                { id: "horario", type: "time", label: "Horário de Pico", default: "20:00", size: "25" },

                { id: "cor_neon", type: "rgb", label: "Cor do Blip e Uniforme (RGB)", default: "#1FA5DE", size: "50" },
                { id: "imposto", type: "range", label: "Taxa da Lavagem", min: 0, max: 100, default: 30, unit: "%", size: "50" },

                { id: "permissoes", type: "checkbox", label: "Permissões do Cargo", size: "50", default: ["bau", "garagem"], options: [
                    { label: "Acessar Baú", value: "bau" },
                    { label: "Retirar Veículos", value: "garagem" },
                    { label: "Recrutar", value: "recrutar" }
                ]},
                { id: "pagamento", type: "radio", label: "Método de Cobrança", size: "50", default: "banco", options: [
                    { label: "Dinheiro Sujo", value: "sujo" },
                    { label: "Transferência Bancária", value: "banco" }
                ]},

                { id: "ativo", type: "switch", label: "Status do Painel", placeholder: "Habilitar funcionamento imediato do ponto", default: true, size: "100" },

                { id: "regras", type: "textarea", label: "Observações Internas", placeholder: "Digite os detalhes...", maxLength: 250, size: "100" }
            ]
        }, "*");
    }
});