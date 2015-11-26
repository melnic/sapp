// ==UserScript==
// @name        Agenda Sapp Layout
// @namespace   agenda_sapp_layout
// @description  Nova Estética para a Agenda Sapp
// @version     0.1
// @grant       none
// @include      *agendasapp/*
// ==/UserScript==

//==============================
//  NÃO ALTERAR  ===============
//==============================


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

function executar(){
// ==/UserScript==

$('#RootMenu').css({
    'border-width':'1.5px',
    'border-color':'rgba(0,0,0,0.2)'
}); 
    
$('span.filtra_menu').css({
    'border-width':'1.5px',
    'border-color':'rgba(0,0,0,0.2)'
})
    
var pagina = {
    calendario: function(){ if (location.href.indexOf("ss_calend.php?")>0){ return true; } },
    plantao: function(){ if (location.href.indexOf("ss_plantao.php?")>0){ return true; } },
    atividade: function(){ if (location.href.indexOf("sesc_atividadesview.php?")>0){ return true; } },
};

if (pagina.atividade()){//Layout de Informações de Atividade
    
}


if (pagina.plantao()){  //Altera Layout de Páginas do Calendário - remover == false

}

if (pagina.calendario()|pagina.plantao()){  //Altera Layout de Páginas do Calendário - remover == false
    $('center').css({
        'text-align':'left',
    });
    $('*').css({
        'font-family' :'arial, sans-serif',
    });
    $('.ativ, a.ativ, a.ativ:hover').css({
        'border': 'none',
        'text-decoration': 'none',
        'font-style': 'normal'
    });
    $('a.link_mes, a.link_mes:hover, a.ativ_perm').css({
        'text-decoration' :'none',
        'font-style':'normal',
        'font-size':'10px',
    });
    $('th').css({
        'font-style': 'normal',
        'line-height':'1em',
        'text-decoration':'none',
        'border':'none'
    });
    
    $('table.calendario>tbody>tr>td').css({
        'border':'solid #CCC 1px',
        //'background-color': '#EEE'
    });
    
    $('td.ativ, td.ativ_perm').css({
        'text-indent':'-2.1em',
        'padding-left':'3em',
        'padding-right':'.4em',
        'padding-top':'.4em',
        'padding-bottom':'.4em',
    });
    
    $('td.ativ_perm br + a').css({
        'margin-left':'-2em',
    });
    
    $('td.ativ_perm *').css({
        'color': 'rgba(0,0,0,1)',
        'font-size':'10px'
    });
    
    $('center b a.ativ_perm').css({
        'color': 'rgba(0,0,0,0.4)',
        //'background-color':'rgba(0,0,0,0.1)',
    });

    $('td.ativ_perm > b *, a > b > span.infra').css({
        'float':'right',
        'height':'100%',
        'color':'rgba(250,0,0,0.3)',
        'font-size':'1.5em',
        'font-style':'normal',
        'background':'none',
    });
    
    $('.local' ).css({
        'float':'right',
        'margin-right':'3px',
        'font-size':'2em !important',
        'font-style':'normal',
        'color': 'rgba(0,0,0,0.33)',
        'text-transform': 'lowercase'
    });
    
    $('div.atividade_texto' ).css({
        'float':'left',
    });
    
    $('.horario' ).css({
        'color': 'rgba(0,0,0,1)'
    });
    
    $('#psearch').css({
        'margin': '5px 0 5px 5px',
        'border':'0px',
        'background-color': 'rgba(255,255,255,0.2)',
        'color': 'rgba(0,0,0,.3)'
    });
    
    
}
}
