// ==UserScript==
// @name         Agenda Sapp Funções
// @namespace    http://your.homepage/
// @version      0.1
// @description  Novas Funcionalidades e Estética para a Agenda SAPP
// @author       Bruno Melnic Incáo
// @match        http://tampermonkey.net/index.php?version=3.10.109&ext=dhdg&updated=true
// @grant        none
// @include      *agendasapp/*

/*
NOTAS DA VERSÃO
O presente código altera a forma como o Firefox lê a SAPP.
Não foi realizada nenhuma alteração no código da SAPP.
Não há garantias sobre o código. Caso não funcione propriamente, desative o Greasemonkey.

MELHORIAS
Função dia atual (vai para o mês e rola a página)
Seleção com múltiplos meses
Retirada do 0 de datas
Verificação de data de atividade insconsistente (apenas para atividades de 1 dia)
Verificação de local de atividade inconsistente (p.e. convivência com ingresso e lotação máxima)
Verificação se atividade possui texto "Com" fulano
Cálculo de custo de camarim.
Abre atividade em nova aba.
Valores padrão para Serviços, Audiovisual, TI, INFRA, Custos, usando CTRL + UP/DOWN
Filtro instantâneo de técnico Tecla TAB
Insere botao salvar e teclado salvar para diversas páginas, CTRL + ENTER
Insere barra de pesquisa no topo de todas as páginas
Controle de Carta de Confirmação facilitado
Abre atividade sempre em nova página
Inserção de horário facilitada no Camarim
Nome da atividade na aba do navegador
Nome do mês na aba do navegador

Layout aprimorado, com atividade, responsável e local
Código pensado para fácil alteração de constantes

*/


// Custos de Alimentação - Usar PONTO, NÃO VIRGULA
var tecnico = 'brunomelnic'; //tem que ser o nome PADRÃO da SAPP
var custo_camarim_tipo1 = 5.26;
var custo_camarim_tipo2 = 28;
var custo_coffee_tipo1 = 7.9;
var custo_coffee_tipo2 = 21.3;
var custo_cha_tsi = 2.50;
var custo_garrafa_agua = 0.82;

// Lista de alternativas padrão
var necessidades_servicos = [
                             'Tatame 8x5 de EVA, sem cadeiras e mesas ao redor',
                             'Espaço livre, com apenas 2 fileiras de cadeiras ao fundo',
                            ];
var necessidades_audiovisual = [
                             '1 headset',
                             '2 headsets',
                             '3 headsets',
                            ];
var necessidades_ti = [
                             'TV com conexão para notebook e passador de slides',                             
                            ];

var necessidades_infra = [
    'X / X \nIluminação interna na Comedoria a partir das XhX0 para retirada dos lanches. \nIluminação do ginásio, para uso dos banheiros, a partir das Xh \n\n11/11 \nManter iluminação do Ginásio acesa até XX h.',
    '',
];

var descricao_custos = [
                             'Custos de cachê e produção.',                             
                            ];    

//===========================================================
//  NÃO ALTERAR DAQUI PARA BAIXO  ===========================
//===========================================================

//HTML padrão para inserir caixa de pesquisa
pesquisa = '<span class="pesquisa" style="font-family: arial,sans-serif;"><form id="fEditaControleslistsrch" class="ewForm" onsubmit="return EditaControles_list.ValidateSearch(this);" action="sesc_editacontroleslist.php" name="fEditaControleslistsrch" style="font-family: arial,sans-serif;"><input id="t" type="hidden" value="EditaControles" name="t" style="font-family: arial,sans-serif;"><input id="psearch" type="text" title="Pesquisar termos" value="" size="15" name="psearch" style="font-family: arial,sans-serif;"></form></span>';

atividade = {
        //Informações Básicas - NÃO ALTERAR
        'id': '',
        'aprovado':'',
        'uso_interno': '',
        'data': '',
        'local': '',
        'titulo':'',
        'complemento':'',
        'contatos':'',
        'meta':'',
        'etaria':'',
        'ingressos':'',
        'vagas':'',
        'receita':'',
        'notificacao':'',
        'esgotado':'',
        'tecnico':'',
        'editado':'',
        
        //Classificação
        'grupo':'',
        'nucleo':'',
        'area':'',
        'projeto':'',
        'ma':'',
        'sma':'',
        'cce':'',
        'sub_atividade':'',
        
        //CheckList
        'dcas':'',
        'contratos':'',
        'custo':'',
        'alimentacao':'',
        'sinopse_fotos':'',
        'servicos':'',
        'infraestrutura':'',
        'ti':'',
        'montagem_extra':'',
        'avaliacao':'',
        'permanente':'',
        'destaque':'',
        'comunicacao':''        
    };

//  Carrega JQuery ================================

(function() {
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script);

    // Poll for jQuery to come into existance
    var checkReady = function(callback) {
        if (window.jQuery) {
            callback(jQuery);
        }
        else {
            window.setTimeout(function() { checkReady(callback); }, 100);
        }
    };

    // Start polling...
    checkReady(function($) {
        executar();
    });
})();


//------------------------
// ==/UserScript==

function executar(){

    
//Variaveis ====================================
    
var id_atividade = null;
var dia = null;
var hora = null;

var pagina = {
    calendario:     function(){ if (location.href.indexOf("ss_calend.php?")>0){ return true; } },
    plantao:        function(){ if (location.href.indexOf("ss_plantao.php?")>0){ return true; } },

    atividade_ver:  function(){ if (location.href.indexOf("sesc_atividadesview.php?")>0){ return true; } },
    
    atividade_edit: function(){ if (location.href.indexOf("sesc_atividadesedit.php?")>0){ return true; } },
    atividade_add:  function(){ if (location.href.indexOf("sesc_atividadesadd.php?")>0){ return true; } },
    
    servico_edit:   function(){ if (location.href.indexOf("sesc_servicosedit.php?")>0){ return true; } },
    servico_add:    function(){ if (location.href.indexOf("sesc_servicosadd.php?")>0){ return true; } },
    
    custos:         function(){ if (location.href.indexOf("sesc_custosedit.php?")>0){ return true; } },
    custos_add:     function(){ if (location.href.indexOf("sesc_custosadd.php?")>0){ return true; } },
    
    caderno_add:    function(){ if (location.href.indexOf("sesc_cadernoadd.php?")>0){ return true; } },
    caderno_edit:   function(){ if (location.href.indexOf("sesc_cadernoedit.php?")>0){ return true; } },
    
    camarim_add:   function(){ if (location.href.indexOf("sesc_camarimadd.php?")>0){ return true; } },
    camarim_edit:  function(){ if (location.href.indexOf("sesc_camarimedit.php?")>0){ return true; } },
    
    ti_add:   function(){ if (location.href.indexOf("sesc_tiadd.php?")>0){ return true; } },
    ti_edit:  function(){ if (location.href.indexOf("sesc_tiedit.php?")>0){ return true; } },
    
    infra_add:  function(){ if (location.href.indexOf("sesc_infraadd.php?")>0){ return true; } },
    infra_edit:  function(){ if (location.href.indexOf("sesc_infraedit.php?")>0){ return true; } },
    
    carta_add: function(){ if (location.href.indexOf("sesc_admadd.php?")>0){ return true; } },
    carta_edit: function(){ if (location.href.indexOf("sesc_admedit.php?")>0){ return true; } },
};

//Ações em Páginas ======================================

//Ações em todas as páginas
inserir_link_logo();
$('#RootMenu').append(pesquisa);

// CARTA CONFIRMAÇÂO ===================================
if (pagina.carta_add()|pagina.carta_edit()){
    habilitar_comando_salvar();
    
    // Insere data de solicitação da carta quando da primeira inserção
    if ($('#x_adm_obs').val() == ''){
        data_hoje = $('#x_adm_data').val();
        $('#x_adm_data').val('');
        $('#x_adm_obs').val('Solicitada em ' + data_hoje);
    }
}    
    
// INFRA ================================================
if (pagina.infra_add()|pagina.infra_edit()){
   inserir_botao_salvar();
   habilitar_comando_salvar();
    
   option = -1;
   $('#x_infra_obs').keydown(function(e){
      alternar_texto_padrao(necessidades_infra, $(this), e);
    })
}
    
//===== TI =============================================
if (pagina.ti_add()|pagina.ti_edit()){
    
   inserir_botao_salvar();
   habilitar_comando_salvar();
    
   option = -1;
   $('#x_ti_obs').keydown(function(e){
      alternar_texto_padrao(necessidades_ti, $(this), e);
    })
}
    
//======= Serviços ======================================    
if (pagina.servico_add()|pagina.servico_edit()){
   $('#x_servicos_obs').focus();
   inserir_botao_salvar();
   habilitar_comando_salvar();
    
   option = -1;
   $('#x_servicos_obs').keydown(function(e){
      alternar_texto_padrao(necessidades_servicos, $(this), e);
    })
      
   $('#x_servicos_audiovisual').keydown(function(e){
         alternar_texto_padrao(necessidades_audiovisual, $(this), e);
    })
   
}
    

    
// Camarim ==============
if (pagina.camarim_add()|pagina.camarim_edit()){
    habilitar_comando_salvar();
    $('#x_camarim_pessoas').focus();
    re = /^\d\d?$/;
    re2 = /^(\d\d)(\d\d)$/;

    //Complementa horário camarim - TERMINAR
    $('#x_camarim_hora').focusout(function(){
        texto = $(this).val();
        (re.exec(texto) != null) ? texto += ':00' : texto = texto;
        
        result = re2.exec(texto);
        (result != null) ? texto = result[1] + ':' + result[2] : texto = texto;
        $(this).val(texto);
    });
}    

//   Atividade    ==========
if (pagina.atividade_edit()|pagina.atividade_add()){
    
    habilitar_comando_salvar();
        
    local = $('#x_local_id');
    ingressos = $('#x_ingressos_id');
    vagas = $('#x_vagas_id');
    complemento = $('#x_ativ_grupo');
    
    //NAO FUNCIONANDO - Verificar se complemento apresenta introdução "Com"
    //verificar_conteudo(complemento, /^Com /g);
    
    //Se Convivência, verifica gratuidade
    verificar_consistencia_local();
    $('#x_local_id').change(function(){
       verificar_consistencia_local();
       });
}    

function verificar_consistencia_local(){
    if(local.val() == 56){ //Se Convivência
        //Ingresso Grátis?
        if(ingressos.val()!=1){
            ingressos.css('color','red');
        }else{
            ingressos.css('color','black');
        }
        
        //Vagas em Branco?
        if(vagas.val()!=21){
            vagas.css('color','red');
        }else{
            ingressos.css('color','black');
        }
    }
}
    
// Caderno =======================    
if (pagina.caderno_add()|pagina.caderno_edit()){
    retirar_zero();
    inserir_botao_salvar();
    habilitar_comando_salvar();
}    

// Custos =========================
if (pagina.custos()|pagina.custos_add()){
    habilitar_comando_salvar();
    $('#x_item_id').focus();
    distribuir_cache(); //Distribui valor do cache pela metade
    inserir_custos_camarim();
    
    option = -1;
    $('#x_custos_obs').keydown(function(e){
      alternar_texto_padrao(descricao_custos, $(this), e);
    })
}

// Plantao Calendário ===============    
if (pagina.plantao()){
   
    adicionar_menu_meses('ss_plantao.php?DADOS=01/', '/2015');
    
    //Abre Atividade em nova aba
    $('td.ativ_perm center > a.ativ_perm').attr('target', '_blank');

    
    //EM CONSTRUÇÃO Adiciona classes para filtragem 
    ativar_filtros();
    diagramar_espaco();
    habilitar_filtro_programador();
    novo_menu_tecnicos();
}    
    
// Calendário Padrão Comum ====================
if (pagina.calendario()){
    adicionar_menu_meses('ss_calend.php?prog_mes=','');
    //Adicionar Função de Camarins
    //$('.camarim').hide();
}

// Visualização da Atividade ================    
if (pagina.atividade_ver()){

    
    
    verificar_datas();
    carregar_dados_atividade();
    document.title = atividade.titulo; //Coloca nome da atividade na ABA do navegador
    
    //alterar_layout();
    adicionar_custo();
    $('.ewFooterRow').hide(); //Oculta rodapé da tabela
    $('.pesquisa').hide(); //Oculta barra inferior de pesquisa
    

    
    obter_sinopse(); //insere sinopse da atividade
    dados_dca(); //Facilita trabalho da Luciana, obtem dados para planilha de controle de DCAs
}

//===== FUNÇÕES COMUNS =============================

//  Define posicionamento de local    
function diagramar_espaco(){
    //Seleciona Texto da Atividade + Lugar
    //item = $('br + a.ativ_perm');
    item = $('center br + a.ativ_perm');
    re = /(^.*[h05])(-)(.*)( \/ )(.*)$/; //informações da atividade
    local_re = /( \/ )(.*)$/;
    $.each(item, function(){
        conteudo = $(this).text();
        local = re.exec(conteudo);
        //console.log(local[1]);
        //$(this).text(conteudo.replace(local_re,'')); //remover local
        $(this).html('<span class="horario">' + local[1] + '</span> ' + local[3]);
        //$(this).siblings('b').append('<span style="float:right"><p style="font-size:1em">' + local[2] + '</p></span>');
        $(this).parent().append('<span class="local" style="float:right;color:rgba(0,0,0,.5)">' + local[5] + '</span>');
        //$(this).siblings('br').remove();
    });
}

// Link para adição de custos    
function adicionar_custo(){
    antigo = $('table.phpmaker td:contains("R$")').eq(-1);
    //Remove Texto Adicionar Padrão
    antigo.html(antigo.html().replace(/<i>.*<\/i>/g,''));
    antigo.html(antigo.html() + '<a id="#adicionar-custo" href="sesc_custosadd.php?showmaster=atividades&ativ_id=' + atividade.id + '">+</a>');
    //$('#adicionar-custo').css('float','right');
    //sesc_custosadd.php?showmaster=atividades&ativ_id=6462
}
    
// Retira Número Zero da sinopse    
function retirar_zero(){
    texto = $('#x_caderno_data_extenso').val();
    r = /,? 0/;
    texto = texto.replace(r, ' ');
    $('#x_caderno_data_extenso').val(texto);
}    

// Novo Layout de Atividade    
function alterar_layout(){
    //Definir Area de Conteudo        
    tabela_esquerda = $('table.ewContentTable td.ewContentColumn > table');
    
    conteudo = inserir_tag('Título Atividade', 'h1');
    tabela_esquerda.html(conteudo);

    //Oculta Controles
    $('#controles, #ligacontroles').hide();
    //Oculta Controles Superiores
    $('table.ewContentTable span.phpmaker').hide();
}

// Ferramenta de Inserção de TAGs para gerar páginas    
function inserir_tag(conteudo, tag){
    total = '<' + tag + '>' + conteudo + '</' + tag + '>';
    return total;
}

// Verifica coerência entre datas da atividade e sinopse
function verificar_datas(){
    celulas = $('table table table td');
    id_atividade = (celulas.eq(2).text());
        
    dia_regex = new RegExp("[0-9][0-9]");
    dia_sinopse_regex = new RegExp("(?!Dia )[0-9]?[0-9]");
    mes_regex = new RegExp("(?![0-9][0-9]/)[0-9][0-9]");
        
    dia = dia_regex.exec(celulas.eq(8).text());
    
    obj_dia_sinopse = $('td:contains("Dia")').eq(-1);
    dia_sinopse = dia_sinopse_regex.exec(obj_dia_sinopse.text());
    
    if (parseInt(dia) != parseInt(dia_sinopse)){ //Mudar para diferente
        obj_dia_sinopse.css({color: "red"});
    }
    
    re = /0\d/;
    if(re.exec(dia_sinopse) != null){
        obj_dia_sinopse.css({color: "red"});
    }
}

//  Gera menu multi meses no calendário
function adicionar_menu_meses(agenda_endereco, ano){
    var d = new Date();
    var mes_atual = d.getMonth();
    var ano_atual = d.getFullYear();
    
    //Adiciona menu multi-mês
    navega_mes = $('table tr th').eq(2); //Seleciona Navegador Meses
    navega_mes.html('');
    
    meses = 'jan fev mar abr mai jun jul ago set out nov dez';
    meses = meses.split(' ');
    
    meses_antes = 6;
    ano_que_vem = 0;
    mes_n = 0;
    
    for (i = 1; i < 13; i++){
       
        mes_n = i + mes_atual - meses_antes - 12 * ano_que_vem;
        navega_mes.append('<a class="link_mes" href="' + agenda_endereco + (mes_n) + '/' +  (ano_atual + ano_que_vem) + '">' + meses[mes_n-1] + '</a> ');
        //Quebra linha de meses em 2
        if(((i)%6)==0){navega_mes.append('</br>')} 
                
        if (mes_n >= 12){ ano_que_vem = 1; }
    }
    
    // Insere nome do mês como título maior
    filtro = /DADOS=\d{1,2}\/\d{1,2}/;
    texto = filtro.exec(location.href);
    filtro = /\d{1,2}$/;
    texto = filtro.exec(texto);
    meses = 'Janeiro Fevereiro Março Abril Maio Junho Julho Agosto Setembro Outubro Novembro Dezembro';
    meses = meses.split(' ');
   
    $('table.calendario tr > th.escolha').text(meses[mes_atual]); //Insere mês atual
    $('table.calendario tr > th.escolha').text(meses[parseInt(texto-1)]); //Insere mês selecionado
    
    document.title = $('table.calendario tr > th.escolha').text();
    
    if (texto == null){
        rolar_tela();
    }
}

//Distribui cache entre producao e cache
function distribuir_cache(){
   $('#x_custos_valor_prev').focusout(function() {
        if ($('#x_item_id').val()==5){
            metade = $(this).val()/2;
            $('#x_custos_cache').val(metade);
            $('#x_custos_producao').val(metade);
        }
    });
}    

// Agiliza inserção de custos de camarim por pax
function inserir_custos_camarim(){
        $('#x_item_id').change(function() {
        if($(this).val()==42){
            qtd_pax = prompt('Quantidade de pessoas');
            $('#x_custos_valor_prev').val(qtd_pax * custo_camarim_tipo2);
            $('#x_custos_cache').val('');
            $('#x_custos_producao').val('');
            $('#x_custos_obs').val('Camarim Tipo 2 para ' + qtd_pax + ' pessoas');            
        }        
    });
}   

    
//Filtros de Calendário - INCOMPLETO
function ativar_filtros(){
    atividade = $('center b a.ativ_perm');
    $.each(atividade, function(){
        $(this).addClass('responsavel');
        $(this).parents('tr').eq(0).addClass('atividade');
        $(this).parents('tr').eq(0).addClass($(this).text());
    });
    
    $('*.local').hide();
}    

// Raspa dados da atividade para alimentar novo leiaute
function carregar_dados_atividade(){
    $campos = $('td.ewTableHeader');
    campos = [];
    $.each($campos, function(i,val){
        campos.push($(this).text());
    });
    
    $valores = $('table.ewTable td > div');
    valores = [];
    $.each($valores, function(i,val){
        valores.push($(this).text());
    });
   
    titulos = ["id", "aprovado?", "uso interno", "primeira data", "local", "atividade", "complemento", "contatos", "meta de atendimento", "recomendação etária", "ingressos", "vagas / lugares", "receita prevista", "notificação", "esgotado?", "técnico", "editado por", "grupo", "núcleo", "área", "projeto", "ma", "sma", "cce", "sub-atividade", "dcas?", "contratos?", "tem custo?", "tem alimentação?", "sinopse e fotos?", "serviços?", "infraestrutura?", "solicitação para TI?", "montagem extra?", "avaliação?", "permanente?", "destaque?", "comunicação", "www1", "www2", "www3"];
    
    atividade.id = obter_dado(0);
    atividade.aprovado = obter_dado(1);
    atividade.uso_interno = obter_dado(2);
    atividade.data = obter_dado(3);
    atividade.local = obter_dado(4);
    atividade.titulo = obter_dado(5);
    atividade.complemento = obter_dado(6);
    atividade.contatos = obter_dado(7);
    atividade.meta = obter_dado(8);
    atividade.etaria = obter_dado(9);
    atividade.ingressos = obter_dado(10);
    atividade.vagas = obter_dado(11);
    atividade.receita = obter_dado(12);
    atividade.notificacao = obter_dado(13);
    atividade.esgotado = obter_dado(14);
    atividade.tecnico = obter_dado(15);
    atividade.editado = obter_dado(16);
    atividade.grupo = obter_dado(17);
    atividade.nucleo = obter_dado(18);
    atividade.area = obter_dado(19);
    atividade.projeto = obter_dado(20);
    atividade.ma = obter_dado(21);
    atividade.sma = obter_dado(22);
    atividade.cce = obter_dado(23);
    atividade.sub_atividade = obter_dado(24);
    atividade.dcas = obter_dado(25);
    atividade.contratos = obter_dado(26);
    atividade.custo = obter_dado(27);
    atividade.alimentacao = obter_dado(28);
    atividade.sinopse_fotos = obter_dado(29);
    atividade.servicos = obter_dado(30);
    atividade.infraestrutura = obter_dado(31);
    atividade.ti = obter_dado(32);
    atividade.montagem_extra = obter_dado(33);
    atividade.avaliacao = obter_dado(34);
    atividade.permanente = obter_dado(35);
    atividade.destaque = obter_dado(36);
    atividade.comunicacao = obter_dado(37);
    atividade.cache = obter_cache();
    
    function obter_dado(local){
        localb = $.inArray(titulos[local], campos);
       if (localb > -1){
           return valores[localb];
       }
    }
    
    function obter_cache(){
        r = /(R\$ [0-9][^ ]*[0-9])/;
        cache = $('td:contains("Cachê")').text();

        cache = r.exec(cache);

        if (cache != null){
            return cache[1];
        }else{
            return "sem cachê";
        }
    }
    
    
}    

// Rola Tela para Dia Atual
function rolar_tela(){
    dias = $('td.dias');
    var d = new Date();
    var n = d.getDate();
    $.each(dias, function(){
        m = parseInt($(this).text());
        if (m == n){
            $('html, body').stop().animate({
              scrollTop: $(this).offset().top * 1.25 // Número é ajuste de rolagem
            }, 1500);
            
            //Destaca Dia de Hoje em Preto
            $(this).parents().eq(3).css({'background-color':'black'});
            $(this).css({'color':'#999'});
        }
        
    });
    
}

// Insere botão salvar    
function inserir_botao_salvar(topo){
       if(topo == null){
           topo = 2.8;
       }
        $('#el_ativ_id').prepend('<input style="float:left; margin-top:-'+ topo +'em;" id="btnAction" type="submit" value="Salvar" name="btnAction">');
}

//Habilita atalho para salvar:CTRL + ENTER, equivalente a clicar no botão EDIT
function habilitar_comando_salvar(){
    $(document).bind('keydown', function(e) {
    if(e.ctrlKey && (e.which == 13)) {
       $('#btnAction').click();
    }
    });
}
    
function habilitar_filtro_programador(){
    $(document).bind('keydown', function(e) {
        if(e.which == 9) { //KeyCode : TAB

        $('.atividade').toggle();
        $('.'+ tecnico).show();
    }
    });
    
}    

//Insere link para Calendário Tipo Plantão para Mês Atual
function inserir_link_logo()    {
    logo = $('div.ewHeaderRow');
    logo_html = '<a href="/agendasapp/ss_plantao.php?" title="Ir para mês atual">' + logo.html() + '</a>';
    logo.html(logo_html);
}

// Aplica Estilo Vermelho em Obj.Val que não atende a Regex
function verificar_conteudo(obj, r){
    if(r.exec(obj.val()) == null){
        obj.css('color','red');
    }else{
        obj.css('color','black');
    }
    obj.change(function(){
        verificar_conteudo($(this), r);
    });
}    

function nome_menu_tecnicos(){
    //console.log($('#tecnicos'));
}    

function alternar_texto_padrao(lista, obj, e){
    if(e.ctrlKey && (e.which == 38)) {
        option --;
        obj.val(lista[option]);
    }
    if(e.ctrlKey && (e.which == 40)) {
        option ++;
        obj.val(lista[option]);
    }
    (option < 0) ? option = -1 : none;
}
    
function obter_sinopse(){
    
    link_sinopse = $('a[href*="cadernoedit"]').attr('href');
    var sino;

    jQuery.ajax({
        type: 'get',
        url: link_sinopse,
        async: false,  //importante, espera por carregamento
        success: function(result) {
           html = jQuery(result);
           sino = html.find("#x_caderno_texto").val();
           }
        });

    $('body').append('<div id="result" style="width:38em; margin: -4em 0 1em 2em">' + sino +'</div>');
    return sino;
}
    
function dados_dca(){
    //Cria campo de texto para facilitar alimentação da planilha da Luciana de
    //controle de DCAs
    
    campo_dados = '<input id="input_dados_dca" type="text" value="" size="1" style="display:none"';
    //$('body').append('<div id=ferramentas></div>');
    //$('.calculadora').append('<div id=ferramentas></div>');
    $('.calculadora').append('<div id=ferramentas></div>');
    $('#ferramentas').append('<div id="dados-dca"> ADM ' + campo_dados + '</div>');
    
    r = /(Núcleo )(.*)/;
    link_prefix = '=HYPERLINK("http://10.96.1.1/agendasapp/sesc_atividadesview.php?ativ_id=';
    dados = atividade.cce + '\t\t';
    dados += atividade.cache + '\t\t\t\t';
    dados += atividade.data + '\t';
    dados += link_prefix + atividade.id + '";"' + atividade.titulo + '")' + '\t';
    dados += r.exec(atividade.nucleo)[2] + '\t';
    dados += atividade.area + '\t';
    dados += atividade.tecnico + '\t';
    
    $('#input_dados_dca').val(dados);
    
    $('#dados-dca').click(function(){
        $('#input_dados_dca').toggle();
        $('#input_dados_dca').select();
    });
    $('#ferramentas').css({
        'background-color':'#87CEE6',
        'width':'6em',
        'padding':'.5em',
        'float':'right',
        'margin-top':'.5em',
        'position':'relative',
        //'margin':'-20em 11em 0 0',
        //'bottom':'60%',
        'right':'11%',
        'top':'5em',
        'z-index':'100'
        //'border-radius':'4px'
    });
}
    
    
} // Fim da Rotina JQuery
