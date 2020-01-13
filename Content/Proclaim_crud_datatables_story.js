
$(document).ready(function () {

    $(".select2").select2({ width: '100%' });
    setTimeout(function () { $('.select2tree').select2tree({ width: '100%' }); }, 20);

    //RESET FORM
    $(".close,#btnbatal").on('click', function () {
        $("#form_modal2").trigger("reset");
    });


    ////DT remember page
    function rememberpage() {
        $('.paginate_button').on('click', function () {
            localStorage.lastpage = $(this).text();
        })
    }

    ////CRUD checkbox
    function checkbox() {
        $('.checklist').iCheck({
            checkboxClass: 'icheckbox_flat-red'
        });
        $('.checklistAll').iCheck({
            checkboxClass: 'icheckbox_flat-red'
        });

        $(".checklistAll").on('ifChecked', function () {
            $("input:checkbox.checklist").iCheck('check');
        });

        $(".checklistAll").on('ifUnchecked', function () {
            $("input:checkbox.checklist").iCheck('uncheck');
        });

        $(".checklist").on('ifChanged', function () {
            var countcheck = $('#DT_Table').find('tbody').find('input:checkbox:checked').length;
            $('#countcheck').text(countcheck);
            if (this.checked) {
                $("#aksicheck").slideDown("2000", function () {
                    $("#aksicheck").removeClass('hidden');
                });
            }
            else if ($(":checkbox:checked").length === 0) {
                $("#aksicheck").fadeOut("700", function () {
                    $("#aksicheck").addClass('hidden');
                });
            }
        });
    }
    

    $.each(CRUDFilter, function (index, value) {
        localStorage.setItem(value, "");
    });
    var read_column = [];
    
    $.ajax({
        type: "GET",
        url: '../CRUD/R_Proc?SP=SYS_GET_COLUMN&tb=' + getUrlVars()["p"] +'&t=' + $.cookie('t'),
        dataType: 'json',
        success: function (response) {
            for (var i = 0; i < response.length; i++) {
                read_column.push({
                    data: response[i].COLUMN_NAME,
                    name: response[i].COLUMN_NAME,
                    title: response[i].COLUMN_NAME
                });
            }
            
            setTimeout(function () {
                Read(),
                Create();
            }, 100);
        }
    });

    ////////////////////////////////////////////////////////READ BEGIN////////////////////////////////////////////////////////
    function Read() {
        $.each(CRUDFilter, function (index, value) {
            $('#DT_filter' + value).on('change', function () {
                localStorage.setItem(value, $(this).val());
                table.draw();
            });
        });
        ////////DATATABLE USER PARAM
        ////////DATATABLE INITIALISATION
        table = $('#DT_Table').DataTable({
            "responsive": true,
            "processing": true,
            "serverSide": true,
            "filter": true,
            "bInfo": true,
            "sPaginationType":
            "simple_numbers",
            "paging": true,
            //"fixedHeader": { headerOffset: 20 },
            "pageLength": 10,
            "deferLoading": 0,
            dom: 'lBfrtip',
            "buttons": [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5',
                'print',
                'colvis'
            ],
            "ajax": {
                "url": CRUDURL,
                "type": "POST",
                "data": function (data) {
                    data.t = $.cookie('t');
                    data.SP = CRUDSP;
                    $.each(CRUDFilter, function (index, value) {                        
                        data[value] = localStorage.getItem(value);
                    });
                },
                "datatype": "json"
            },
            "language": {
                "sProcessing": "<span class='fa fa-spin fa-gear fa-2x'></span>",
                "sLengthMenu": "Tampilkan _MENU_ " + unit+"&nbsp;&nbsp;",
                "sZeroRecords": "Opps, Tidak ditemukan " + unit + " satupun yang sesuai dengan pencarian/filter kamu",
                "sInfo": "Menampilkan _START_-_END_ dari _TOTAL_ " + unit,
                "sInfoEmpty": "Menampilkan 0-0 dari 0 " + unit,
                "sSearch": "Cari "+ unit+": ",
                "sInfoFiltered": "(disaring dari _MAX_ " + unit + " keseluruhan)",
                "oPaginate": {
                    "sFirst": "Awal",
                    "sPrevious": '<i class="fa fa-angle-left">',
                    "sNext": '<i class="fa fa-angle-right">',
                    "sLast": "Akhir"
                },
                buttons: {
                    colvis: 'Kolom'
                }
            },
            //"columns": ,
            "columns": read_column,
            "lengthMenu": [[10, 50, 100, 1000], ['10', '50', '100', '1000']],
            //initComplete: function (settings, json) {
            //    console.log(settings);
            //    //if (json.length) {
            //    //    $(document).find('#inputsirupv2').removeClass('d-none');
            //    //}
                
            ////    setTimeout(function () {
            ////        table.page(parseInt(localStorage.lastpage) - 1).draw('page');
            ////    }, 10);
            //}
        });

        ////////DATATABLE SEARCH
        function DT_search() {
            $('#DT_search').on('paste keyup', function () {
                if ($(this).val().length > 2) {
                    table.search($(this).val()).draw();
                }
                if ($(this).val().length === 0) {
                    table.search("").draw();
                }
            });
        }

        ///////DATATABLE PAGE LIMIT
        function DT_limitpage() {
            $('.DT_limitpage').append($('#DT_Table_length'));
            $('.DT_limitpage').on('change', function () {
                table.page.len($(this).val()).draw();
            });
        }

        DT_draw();
        DT_search();
        DT_limitpage();
        
        function DT_draw() {
            ////////DATATABLE DRAW CONDITION
            $('#DT_Table').on('draw.dt', function (setting, json) {
                if (json.aoData.length && getUrlVars()["p"] == "SIPKD_SIRUPV2") {
                    $(document).find('#inputsirupv2').removeClass('d-none');
                }
                else {
                    $(document).find('#inputsirupv2').addClass('d-none');
                }
                rememberpage();
                Update();
                Delete();
                checkbox();

                $(".checklistAll").prop('checked', false);
                $("input:checkbox.checklist").prop('checked', false).trigger('change');
                $("#aksicheck").addClass('hidden');
            });
        }
        /////////////////////////////DATATABLES END////////////////////////////////////
    }


    ////////////////////////////////////////////////////////READ END////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////CREATE BEGIN////////////////////////////////////////////////////////
    function Create() {
        $("#btn_tambah").on('click', function () {
            $(".JudulForm").text("Tambah " + unit);
            var form = $('#form_modal2');
            form.attr("action", "../CRUD/C_Table");
            $('#btn_ubahdata').addClass('hidden');
            $('#btn_simpandatabaru').removeClass('hidden');
            //$('#edit_UNITKEY').val($('#DT_filter1').val()).trigger('change');
        });
    }
    

    //SIMPAN DATA BARU
    $("#btn_simpandatabaru").on('click', function (e) {
        //$('#edit_ID').val($('#edit_NIP').val());
        var form = $('#form_modal2');
        var validator = form.data("bs.validator");
        validator.validate();
        if (!validator.hasErrors()) {
            var queryform = form.serialize() + '&tb=' + CRUDtbl + "&t=" + $.cookie('t');
            $.ajax({
                type: "POST",
                url: form.attr('action') + "?" + queryform,
                dataType: 'json',
                success: function (response) {
                    $('.close').click();
                    if (response === "OK") {
                        Command: toastr["success"]("Berhasil ditambahkan ke database", "Berhasil !")
                        table.page(parseInt(localStorage.lastpage) - 1).draw('page');
                    } else {
                        Command: toastr["error"]("Data <strong> GAGAL </strong> ditambahkan ke database", "Error !")
                    }
                }
            });
        }
    });
    ////////////////////////////////////////////////////////CREATE END////////////////////////////////////////////////////////
    
    
    ////////////////////////////////////////////////////////UPDATE BEGIN////////////////////////////////////////////////////////
    function Update() {
        $('.btn_edit').on('click', function () {
            var ID = $(this).parent().siblings(".DT_ROWID").text().trim();
            
            $.ajax({
                type: "GET",
                url: '../CRUD/R_Proc',
                data: 'SP=' + CRUDtbl + '_DET_BYID&ID=' + ID + "&t=" + $.cookie('t'),
                success: function (response) {
                    var data = $.parseJSON(response);
                    //$("#edit_" + CRUDPk).val(ID).trigger('change');
                    //console.log(data);

                    $.each(data[0], function (index, value) {
                        $('#edit_' + index).val(value).trigger('change');
                        //var idchained = [];
                        setTimeout(function () {
                            $(".chained").each(function () {
                                //idchained.push($(this).attr('name'));
                                $("#edit_" + $(this).attr('name')).val(value).trigger('change')
                            });
                            
                        }, 200);
                    });
                }
            });

            $(".JudulForm").text("Ubah Data " + unit);
            $('#btn_simpandatabaru').addClass('hidden');
            $('#btn_ubahdata').removeClass('hidden');
        });
    }

    //UBAH DATA KE DATABASE
    $("#btn_ubahdata").on('click', function () {
        var ID = $("#edit_ID").val();
        var form = $('#form_modal2');
        var validator = form.data("bs.validator");
        validator.validate();
        if (!validator.hasErrors()) {
            var queryform = form.serialize() + "&tb=" + CRUDtbl + "&pk=ID&ID=" + ID + "&t=" + $.cookie('t');
            $.ajax({
                type: "POST",
                url: '../CRUD/U_Table?' + queryform,
                dataType: 'json',
                success: function (response) {
                    if (response === "OK") {
                        $('.close').click();
                        Command: toastr["success"]("Berhasil Diubah", "Berhasil !")
                        table.page(parseInt(localStorage.lastpage) - 1).draw('page');
                    } else {
                        Command: toastr["error"]("Data <strong> GAGAL </strong> diubah", "Error !")
                    }
                }
            });
        }
    });
    ////////////////////////////////////////////////////////UPDATE END////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////DELETE BEGIN////////////////////////////////////////////////////////
    function Delete() {
        //var ID;
        ////SINGLE DELETE
        $('.btn_hapus').on('click', function () {
            var ID = $(this).parent().siblings(".DT_ROWID").text().trim();
            swal({
                title: 'Yakin mau dihapus?',
                text: "Hati-hati kamu gak bisa ngembaliin data ini lagi!",
                type: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Batal',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Hapus!'
            }).then((result) => {
                if (result.value) {
                    $.ajax({
                        type: "POST",
                        url: '../CRUD/D_Table?tb=' + CRUDtbl + '&ID=' + ID + "&t=" + $.cookie('t'),
                        success: function (response) {
                            if (response === "OK") {
                                Command: toastr["success"]("Data Barang telah dihapus", "OK !")
                                table.page(1).draw('page');

                            } else {
                                Command: toastr["error"]("Data Barang <strong> GAGAL </strong> dihapus", "Error !")
                            }
                        }
                    });
                }
            })
        });

        ////MULTI DELETE
        $('#aksicheck').on('click', function () {
            var id = [];

            $('#DT_Table').find('tbody').find('.checked').each(function () {
                id.push($(this).parent().siblings('.DT_ROWID').text().trim());
            });
            //console.log(id);

            swal({
                title: 'Yakin mau dihapus?',
                text: "Hati-hati kamu gak bisa ngembaliin data ini lagi!",
                type: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Batal',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Hapus!'
            }).then((result) => {
                if (result.value) {
                    $.ajax({
                        type: "POST",
                        url: '../CRUD/D_TableMulti',
                        data: 'pk=ID&id=' + id + '&tb=' + CRUDtbl + "&t=" + $.cookie('t'),
                        success: function (response) {
                            Command: toastr["success"](response, "OK !")
                            table.page(1).draw('page');
                            $(this).addClass('hidden');
                        }
                    });
                }
            })

        });

    }

    ////////////////////////////////////////////////////////DELETE END////////////////////////////////////////////////////////
});