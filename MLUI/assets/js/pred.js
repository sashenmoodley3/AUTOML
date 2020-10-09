var tabCount = 0;
/** drop target **/
var _target = document.body;
var _file = document.getElementById('file');
/** Spinner **/
var spinner;

var _workstart = function () { spinner = new Spinner().spin(_target); }
var _workend = function () { spinner.stop(); }

/** Alerts **/
var _badfile = function () {
    alertify.alert('This file does not appear to be a valid Excel file. ', function () { });
};

var _pending = function () {
    alertify.alert('Please wait until the current file is processed.', function () { });
};

var _large = function (len, cb) {
    alertify.confirm("This file is " + len + " bytes and may take a few moments.  Your browser may lock up during this process.  Shall we play?", cb);
};

var _failed = function (e) {
    console.log(e, e.stack);
    alertify.alert('Error Occured.', function () { });
};

/** Handsontable magic **/
var boldRenderer = function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.TextCell.renderer.apply(this, arguments);
    $(td).css({ 'font-weight': 'bold' });
};

var $container, $parent, $window, availableWidth, availableHeight;
var $sql, $sqlpre, sqldb;

var $containerPred, $parentPred, $windowPred, availableWidthPred, availableHeightPred;

var calculateSize = function () {
    var offset = $container.offset();
    availableWidth = Math.max($window.width() - 250, 600) / 1.2;
    availableHeight = Math.max($window.height() - 250, 400) / 2.8;
};

var calculateSizePred = function () {
    var offset = $container.offset();
    availableWidthPred = Math.max($window.width() - 250 , 600);
    availableHeightPred = Math.max($window.height() - 400 , 400);
};

var modelName = ""

$(document).ready(function () {
    // ----- Predication Table -----
    // $containerPred = $("#hotPred");
    // $parentPred = $container.parent();
    // $windowPred = $(window);
    // $window.on('resize', calculateSizePred);

    // -----------------------------
    $container = $("#hot");
    $parent = $container.parent().parent();
    $window = $(window);
    $window.on('resize', calculateSize);
    $sqlpre = document.getElementById('sqlpre');
    $sql = document.getElementById('sql');
    $("#triggerFile").on("click", evt => {
        evt.preventDefault();
        $("input[type=file]").click();
    });
    $('#submitClicked').on("click", args => {
        submitForm();
    })

    $('#modelDropDown').on('change', function () {
        modelName = this.value;
    });
    setupWizard();
    loadFileNames();
});

function setupWizard() {
    $('.nav-tabs > li a[title]').tooltip();

    //Wizard
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {

        var $target = $(e.target);

        if ($target.parent().hasClass('disabled')) {
            return false;
        }

        if (e.target.hash === "#step1") {
            tabCount = 0;
        } else if (e.target.hash === "#step2") {
            tabCount = 1;
            exportitForPred();
            //createPredDataSheet();
        } else if (e.target.hash === "#complete") {
            tabCount = 2;
        }
    });

    $("#nextClicked").click(function (e) {

        var $active = $('.wizard .nav-tabs li.active');
        $active.next().removeClass('disabled');
        nextTab($active);

    });
    $("#prevClicked").click(function (e) {

        var $active = $('.wizard .nav-tabs li.active');
        prevTab($active);

    });
}

function nextTab(elem) {
   
   $(elem).next().find('a[data-toggle="tab"]').click();

    if(tabCount === 2) {
        return;
    }

    //tabCount++;
}


function prevTab(elem) {
    $(elem).prev().find('a[data-toggle="tab"]').click();

    if(tabCount === 0) {
        return;
    }

    //tabCount--;
}

function submitForm() {
    modal.style.display = "block";
}

var __PredData = [];

var _onsheetPred = function (json, cols) {
    
    json = getPredJsonValues(json);
    cols = getPredColsValues(cols);
    $('#footnote').hide();
    /* add header row for table */
    if (!json) json = [];
    json.unshift(function (head) { var o = {}; for (i = 0; i != head.length; ++i) o[head[i]] = head[i]; return o; }(cols));
    calculateSizePred();
    /* showtime! */
    $("#hotPred").handsontable({
        data: json,
        startRows: 5,
        startCols: 3,
        fixedRowsTop: 1,
        stretchH: 'all',
        rowHeaders: true,
        columns: cols.map(function (x) { return { data: x }; }),
        colHeaders: cols,
        cells: function (r, c, p) {
            if (r === 0) this.renderer = boldRenderer;
        },
        width: function () { return availableWidthPred; },
        height: function () { return availableHeightPred; },
        stretchH: 'all'
    });
    __PredData = json;
};

function getPredJsonValues(json) {
    json.shift();
    for (var i = 0; i < json.length; i++) {
        json[i]["Predicted Value"] = predData[i];  
    }

    return json;
}

function getPredColsValues(cols) {
    cols.push("Predicted Value");
    return cols;
}

var __data = [];
var __jsonData = [];
var __cols = [];

var _onsheet = function (json, cols) {   
    __jsonData = json;
    __cols = cols;
    $('#footnote').hide();
    /* add header row for table */
    if (!json) json = [];
    json.unshift(function (head) { var o = {}; for (i = 0; i != head.length; ++i) o[head[i]] = head[i]; return o; }(cols));
    calculateSize();
    /* showtime! */
    $("#hot").handsontable({
        data: json,
        startRows: 5,
        startCols: 3,
        fixedRowsTop: 1,
        stretchH: 'all',
        rowHeaders: true,
        columns: cols.map(function (x) { return { data: x }; }),
        colHeaders: cols,
        cells: function (r, c, p) {
            if (r === 0) this.renderer = boldRenderer;
        },
        width: function () { return availableWidth; },
        height: function () { return availableHeight; },
        stretchH: 'all'
    });
    __data = json;
    if (__data.length) $("#exporter").removeAttr('disabled');
};

function exportitFinal() {
    var ws = XLSX.utils.json_to_sheet(__data, { skipHeader: true });
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    var fileName = "FinalResult" + ".csv";
    XLSX.writeFile(wb, fileName);

}

function exportitForPred() {
    debugger
    var ws = XLSX.utils.json_to_sheet(__data, { skipHeader: true });
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    var fileName = guidGen() + "Predict" + ".csv";
    XLSX.writeFile(wb, fileName);
    setTimeout(function(){ runPrediction(fileName); }, 1000);

}
var predData = [];
function runPrediction(fileName) {
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/test",
        data: JSON.stringify({ ModelName: modelName, FileName:fileName}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){
          if (data["predictions"].length > 0) {
            predData = data["predictions"][0];
            createPredDataSheet();
          } else {
              alert("No data returned")
          }
        },
        error: function(errMsg) {
            alert(errMsg);
        }
    });
}

function createPredDataSheet() {
     // ----- Predication Table -----
     setTimeout(function(){ 
        $containerPred = $("#hotPred");
        $parentPred = $container.parent().parent();
        $windowPred = $(window);
        $window.on('resize', calculateSizePred);
        _onsheetPred(__jsonData, __cols); 
    }, 1000);
    
}

function guidGen() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function loadFileNames() {
    debugger;
    select = document.getElementById('modelDropDown');
    removeOptions(select);
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:5000/files",
        success: function (data) {
           var names = data["Filenames"][0];
           names.forEach(function (name) { 
            var opt = document.createElement('option');
            opt.value = name;
            opt.innerHTML = name;
            select.appendChild(opt);
            }); 
        },
        error: function (errMsg) {
            //alert(errMsg);
        }
    });
}

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
  }

function sexqlit(data) {
    // console.log(data, data.rows, data.rows.length);
    if (!data || data.length === 0) return;
    var r = data.rows.item(0);
    var cols = Object.keys(r);
    var json = [];
    for (var i = 0; i < data.rows.length; ++i) {
        r = data.rows.item(i);
        var o = {};
        cols.forEach(function (x) { o[x] = r[x]; });
        json.push(o);
    }
    //console.log(json,cols);
    _onsheet(json, cols);
}

function sexql() {
    $sqlpre.classList.remove("error");
    $sqlpre.classList.remove("info");
    var stmt = $sql.value;
    if (!stmt) return;
    if (stmt.indexOf(";") > -1) stmt = stmt.substr(0, stmt.indexOf(";"));
    $sqlpre.innerText = stmt;

    sqldb.transaction(function (tx) {
        tx.executeSql(stmt, [], function (tx, results) {
            $sqlpre.classList.add("info");
            sexqlit(results);
        }, function (tx, e) {
            $sqlpre.innerText += "\n" + e + "\n" + (e.message || "") + "\n" + (e.stack || "");
            $sqlpre.classList.add("error");
        });
    });
}

function prepstmt(s) {
    //console.log(s);
    sqldb.transaction(function (tx) { tx.executeSql(s, [], function () { }, function () { }); });
}

function prepforsexql(ws, sname) {
    /* Get sheet range */
    if (!ws || !ws['!ref']) return;
    var range = XLSX.utils.decode_range(ws['!ref']);
    if (!range || !range.s || !range.e || range.s > range.e) return;
    var R = range.s.r, C = range.s.c;

    /* Generate headers */
    var names = new Array(range.e.c - range.s.c + 1);
    for (C = range.s.c; C <= range.e.c; ++C) {
        var addr = XLSX.utils.encode_cell({ c: C, r: R });
        names[C - range.s.c] = ws[addr] ? ws[addr].v : XLSX.utils.encode_col(C);
    }
    /* De-duplicate headers */
    for (var i = 0; i < names.length; ++i) if (names.indexOf(names[i]) < i)
        for (var j = 0; j < names.length; ++j) {
            var _name = names[i] + "_" + (j + 1);
            if (names.indexOf(_name) > -1) continue;
            names[i] = _name;
        }

    /* Guess column types */
    var types = new Array(range.e.c - range.s.c + 1);
    for (C = range.s.c; C <= range.e.c; ++C) {
        var seen = {}, _type = "";
        for (R = range.s.r + 1; R <= range.e.r; ++R) seen[(ws[XLSX.utils.encode_cell({ c: C, r: R })] || { t: "z" }).t] = true;
        if (seen.s || seen.str) _type = "TEXT";
        else if (seen.n + seen.b + seen.d + seen.e > 1) _type = "TEXT";
        else switch (true) {
            case seen.b:
            case seen.n: _type = "REAL"; break;
            case seen.e: _type = "TEXT"; break;
            case seen.d: _type = "TEXT"; break;
        }
        types[C - range.s.c] = _type || "TEXT";
    }


    /* create table */
    prepstmt("DROP TABLE IF EXISTS `" + sname + "`");
    prepstmt("CREATE TABLE `" + sname + "` (" + names.map(function (n, i) { return "`" + n + "` " + (types[i] || "TEXT"); }).join(", ") + ");");

    /* insert data */
    for (R = range.s.r + 1; R <= range.e.r; ++R) {
        var fields = [], values = [];
        for (var C = range.s.c; C <= range.e.c; ++C) {
            var cell = ws[XLSX.utils.encode_cell({ c: C, r: R })];
            if (!cell) continue;
            fields.push("`" + names[C - range.s.c] + "`");
            var val = cell.v;
            switch (types[C - range.s.c]) {
                case 'REAL': if (cell.t == 'b' || typeof val == 'boolean') val = +val; break;
                default: val = '"' + val.toString().replace(/"/g, '""') + '"';
            }
            values.push(val);
        }
        prepstmt("INSERT INTO `" + sname + "` (" + fields.join(", ") + ") VALUES (" + values.join(",") + ");");
    }

}

function sexqlify(wb) {
    document.getElementById('sql').oninput = sexql;
    if (wb.Sheets && wb.Sheets.Data && wb.Sheets.Metadata) document.getElementById('sql').value = "SELECT Format, Importance as Priority, Data.Code, css_class FROM Data JOIN Metadata ON Metadata.code = Data.code WHERE Importance < 3";
    else document.getElementById('sql').value = "SELECT * FROM `" + wb.SheetNames[0] + "`";
    $sexqls = document.getElementById('sexqls');
    if (typeof openDatabase === 'undefined') {
        sqldiv.innerHTML = '<div class="error"><b>*** WebSQL not available.  Consider using Chrome or Safari ***</b></div>';
        return;
    }
    sqldb = openDatabase('sheetjs', '1.0', 'sexql', 3 * 1024 * 1024);
    wb.SheetNames.forEach(function (s) { prepforsexql(wb.Sheets[s], s); });
    sexql();
    $sql.disabled = false;
}


var _onwb = function (wb, type, sheetidx) {
    sexqlify(wb);
}

/** Drop it like it's hot **/
DropSheet({
    file: _file,
    drop: _target,
    on: {
        workstart: _workstart,
        workend: _workend,
        //sheet: _onsheet,
        wb: _onwb,
        foo: 'bar'
    },
    errors: {
        badfile: _badfile,
        pending: _pending,
        failed: _failed,
        large: _large,
        foo: 'bar'
    }
});
