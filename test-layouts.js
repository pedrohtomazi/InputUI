// ============================================================================
// PAINEL DE TESTE DE LAYOUTS (Exclusivo para visualização no Navegador / Live Server)
// ============================================================================
$(function () {
    if (!window.invokeNative) {
        // Estiliza o fundo da página para simular o jogo
        $("body").css({
            "background-image": "url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1920&auto=format&fit=crop')",
            "background-size": "cover",
            "background-position": "center",
            "margin": "0",
            "overflow": "hidden"
        });

        // Cria a barra flutuante de testes no canto superior direito
        const toolbarHtml = `
            <div id="layoutTestToolbar" style="position: fixed; top: 2vh; right: 2vw; z-index: 10000; background: rgba(16, 22, 28, 0.95); border: 1px solid rgba(255,255,255,0.15); padding: 1vh 1vw; border-radius: 0.5vw; display: flex; gap: 0.5vw; align-items: center; box-shadow: 0 1vh 2vw rgba(0,0,0,0.8);">
                <span style="color: #fff; font-size: 0.65vw; font-family: sans-serif; font-weight: 600; margin-right: 0.5vw;">TESTE DE LAYOUT:</span>
                <button type="button" class="testBtn" data-layout="1" style="padding: 0.6vh 0.8vw; background: #1FA5DE; border: none; color: #fff; border-radius: 0.3vw; cursor: pointer; font-size: 0.6vw; font-weight: 600;">1 (Esquerda)</button>
                <button type="button" class="testBtn" data-layout="2" style="padding: 0.6vh 0.8vw; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 0.3vw; cursor: pointer; font-size: 0.6vw; font-weight: 600;">2 (Esq + Dir)</button>
                <button type="button" class="testBtn" data-layout="3" style="padding: 0.6vh 0.8vw; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 0.3vw; cursor: pointer; font-size: 0.6vw; font-weight: 600;">3 (Esq + Centro + Dir)</button>
            </div>
        `;
        $("body").append(toolbarHtml);

        // Função que dispara o layout escolhido
        function loadTestLayout(type) {
            let panelsConfig = [];

            if (type === 1) {
                // Layout 1: Apenas na Esquerda
                panelsConfig = [
                    {
                        position: "left",
                        width: "sm",
                        title: "Painel Esquerdo",
                        subtitle: "Apenas um lado",
                        inputs: [
                            { id: "txt_unico", type: "text", label: "Seu Nome", placeholder: "Digite algo...", size: "100", required: true }
                        ]
                    }
                ];
            } else if (type === 2) {
                // Layout 2: Esquerda e Direita
                panelsConfig = [
                    {
                        position: "left",
                        width: "sm",
                        title: "Lado Esquerdo",
                        subtitle: "Configurações gerais",
                        inputs: [
                            { id: "empresa", type: "text", label: "Nome da Empresa", size: "100" },
                            { id: "setor", type: "select", label: "Setor", size: "100", options: [{ label: "Comércio", value: "comercio" }, { label: "Industrial", value: "industrial" }] }
                        ]
                    },
                    {
                        position: "right",
                        width: "sm",
                        title: "Lado Direito",
                        subtitle: "Estética & Cores",
                        inputs: [
                            { id: "cor_primaria", type: "rgb", label: "Cor Principal", default: "#1FA5DE", size: "100" },
                            { id: "taxa", type: "range", label: "Taxa", min: 0, max: 100, default: 15, unit: "%", size: "100" }
                        ]
                    }
                ];
            } else if (type === 3) {
                // Layout 3: Esquerda, Centro e Direita (Proporcionais)
                panelsConfig = [
                    {
                        position: "left",
                        title: "1. Identificação",
                        subtitle: "Dados básicos",
                        inputs: [
                            { id: "nome_esq", type: "text", label: "Nome", placeholder: "João...", size: "100", required: true },
                            { id: "idade_esq", type: "number", label: "Idade", default: 25, size: "100" }
                        ]
                    },
                    {
                        position: "center",
                        title: "2. Configuração",
                        subtitle: "Preferências",
                        inputs: [
                            { id: "cargo_centro", type: "select", label: "Cargo", size: "100", default: "membro", options: [{ label: "Membro", value: "membro" }, { label: "Líder", value: "lider" }] },
                            { id: "status_centro", type: "switch", label: "Ativo", placeholder: "Habilitar", default: true, size: "100" }
                        ]
                    },
                    {
                        position: "right",
                        title: "3. Customização",
                        subtitle: "Cores e taxas",
                        inputs: [
                            { id: "cor_dir", type: "rgb", label: "Cor (RGB)", default: "#1FA5DE", size: "100" },
                            { id: "comissao_dir", type: "range", label: "Comissão", min: 0, max: 50, default: 10, unit: "%", size: "100" }
                        ]
                    }
                ];
            }

            // Dispara o evento interno simulando o FiveM
            window.postMessage({
                nuiType: "input",
                inputAction: "open",
                gameName: "fivem",
                backdrop: false,
                messages: {
                    confirm: "Confirmar",
                    cancel: "Fechar"
                },
                panels: panelsConfig
            }, "*");
        }

        // Evento de clique nos botões da barra de teste
        $(document).on("click", ".testBtn", function () {
            $(".testBtn").css({ "background": "rgba(255,255,255,0.1)", "border": "1px solid rgba(255,255,255,0.2)" });
            $(this).css({ "background": "#1FA5DE", "border": "none" });
            
            const layoutType = Number($(this).data("layout"));
            loadTestLayout(layoutType);
        });

        // Carrega o layout 3 por padrão ao abrir o Live Server para você já conferir como fica
        loadTestLayout(1);
    }
});