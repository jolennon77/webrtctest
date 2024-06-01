import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



function initjanus() {
  // WebRTC 지원 여부 확인
  if (!Janus.isWebrtcSupported()) {
    bootbox.alert("WebRTC를 지원하지 않습니다... ");
    return;
  }
  // Janus 세션 생성
  janus = new Janus({
    server: server,  // 서버 주소
    success: function () {
      // VideoRoom 플러그인에 연결
      janus.attach({
        plugin: "janus.plugin.videoroom",  // 비디오룸 플러그인 지정
        opaqueId: opaqueId,  // 세션의 고유 ID 설정
        success: function (pluginHandle) {
          // 플러그인 핸들러 저장 및 UI 업데이트
          $("#details").remove();  // 상세 정보 요소 제거
          sfutest = pluginHandle;  // 핸들러 저장
          Janus.log("플러그인 연결됨! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
          Janus.log("  -- 퍼블리셔/매니저입니다.");
          // 사용자 이름 등록 준비
          $("#videojoin").removeClass("hide").show();  // 비디오 참가 요소 표시
          $("#registernow").removeClass("hide").show();  // 등록 요소 표시
          $("#register").click(registerUsername);  // 등록 버튼 클릭 이벤트 설정
          $("#roomname").focus();  // 방 이름 입력란에 포커스 설정
          // 시작 버튼 설정
          // $("#start")
          //     .removeAttr("disabled")
          //     .html("Stop")  // 버튼 텍스트 변경
          //     .click(function () {
          //       $(this).attr("disabled", true);  // 버튼 비활성화
          //       janus.destroy();  // Janus 세션 종료
          //     });

          Janus.log("방 목록 > ");
          //roomList(); // 주석 처리된 함수 호출
        },
        error: function (error) {
          // 플러그인 연결 오류 처리
          Janus.error("  -- 플러그인 연결 오류...", error);
          bootbox.alert("플러그인 연결 오류... " + error);
        },
        consentDialog: function (on) {
          // 사용자 미디어 권한 요청 다이얼로그 표시
          Janus.debug("권한 요청 다이얼로그가 " + (on ? "켜졌습니다" : "꺼졌습니다") + " 이제");
          if (on) {
            // 화면을 어둡게 하고 힌트 표시
            $.blockUI({
              message: '<div><img src="up_arrow.png"/></div>',  // 화살표 이미지 표시
              css: {
                border: "none",
                padding: "15px",
                backgroundColor: "transparent",
                color: "#aaa",
                top: "10px",
                left: navigator.mozGetUserMedia ? "-100px" : "300px",
              },
            });
          } else {
            // 화면 복원
            $.unblockUI();
          }
        },
        iceState: function (state) {
          // ICE 상태 변경 로그
          Janus.log("ICE 상태가 " + state + "로 변경되었습니다.");
        },
        mediaState: function (medium, on) {
          // 미디어 상태 변경 로그
          Janus.log("Janus가 우리의 " + medium + " 수신을 " + (on ? "시작" : "중지") + "했습니다.");
        },
        webrtcState: function (on) {
          // WebRTC 상태 변경 로그
          Janus.log("Janus가 우리의 WebRTC PeerConnection이 " + (on ? "활성화" : "비활성화") + "되었습니다.");
          $("#videolocal").parent().parent().unblock();  // 로컬 비디오 요소의 부모 요소의 차단 해제
          if (!on) return;
          $("#publish").remove();  // 퍼블리시 버튼 제거
          // 비트레이트 설정 UI 표시
          $("#bitrate").parent().parent().removeClass("hide").show();
          $("#bitrate a").click(function () {
            var id = $(this).attr("id");
            var bitrate = parseInt(id) * 1000;
            if (bitrate === 0) {
              Janus.log("REMB를 통해 대역폭을 제한하지 않습니다.");
            } else {
              Janus.log("REMB를 통해 대역폭을 " + bitrate + "으로 제한합니다.");
            }
            $("#bitrateset")
                .html($(this).html() + '<span class="caret"></span>')
                .parent()
                .removeClass("open");
            sfutest.send({ message: { request: "configure", bitrate: bitrate } });
            return false;
          });
        },
        onmessage: function (msg, jsep) {
          // 서버로부터의 메시지 처리
          Janus.debug(" ::: 메시지 수신 (퍼블리셔) :::", msg);
          var event = msg["videoroom"];
          Janus.debug("이벤트: " + event);
          if (event) {
            if (event === "joined") {
              // 방에 성공적으로 참여한 경우
              myid = msg["id"];
              mypvtid = msg["private_id"];
              Janus.log("방 " + msg["room"] + "에 ID " + myid + "로 성공적으로 참여했습니다.");
              if (subscriber_mode) {
                $("#videojoin").hide();
                $("#videos").removeClass("hide").show();
              } else {
                publishOwnFeed(true);  // 자신의 피드를 퍼블리시
              }
              // 새 피드를 연결
              if (msg["publishers"]) {
                var list = msg["publishers"];
                Janus.debug("사용 가능한 퍼블리셔/피드 목록을 받았습니다:", list);
                for (var f in list) {
                  var id = list[f]["id"];
                  var display = list[f]["display"];
                  var audio = list[f]["audio_codec"];
                  var video = list[f]["video_codec"];
                  Janus.debug("  >> [" + id + "] " + display + " (오디오: " + audio + ", 비디오: " + video + ")");
                  newRemoteFeed(id, display, audio, video);  // 새 원격 피드 설정
                }
              }
            } else if (event === "destroyed") {
              // 방이 파괴된 경우
              Janus.warn("방이 파괴되었습니다!");
              bootbox.alert("방이 파괴되었습니다.", function () {
                window.location.reload();
              });
            } else if (event === "event") {
              // 이벤트 처리
              if (msg["publishers"]) {
                var list = msg["publishers"];
                Janus.debug("사용 가능한 퍼블리셔/피드 목록을 받았습니다:", list);
                for (var f in list) {
                  var id = list[f]["id"];
                  var display = list[f]["display"];
                  var audio = list[f]["audio_codec"];
                  var video = list[f]["video_codec"];
                  Janus.debug("  >> [" + id + "] " + display + " (오디오: " + audio + ", 비디오: " + video + ")");
                  newRemoteFeed(id, display, audio, video);  // 새 원격 피드 설정
                }
              } else if (msg["leaving"]) {
                // 퍼블리셔가 방을 떠난 경우
                var leaving = msg["leaving"];
                Janus.log("퍼블리셔가 떠났습니다: " + leaving);
                var remoteFeed = null;
                for (var i = 1; i < 6; i++) {
                  if (feeds[i] && feeds[i].rfid == leaving) {
                    remoteFeed = feeds[i];
                    break;
                  }
                }
                if (remoteFeed != null) {
                  Janus.debug("피드 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ")가 방을 떠났습니다, 분리합니다.");
                  $("#remote" + remoteFeed.rfindex).empty().hide();
                  $("#videoremote" + remoteFeed.rfindex).empty();
                  feeds[remoteFeed.rfindex] = null;
                  remoteFeed.detach();
                }
              } else if (msg["unpublished"]) {
                // 퍼블리셔가 비공개로 전환된 경우
                var unpublished = msg["unpublished"];
                Janus.log("퍼블리셔가 비공개로 전환되었습니다: " + unpublished);
                if (unpublished === "ok") {
                  // 현재 사용자
                  sfutest.hangup();
                  return;
                }
                var remoteFeed = null;
                for (var i = 1; i < 6; i++) {
                  if (feeds[i] && feeds[i].rfid == unpublished) {
                    remoteFeed = feeds[i];
                    break;
                  }
                }
                if (remoteFeed != null) {
                  Janus.debug("피드 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ")가 방을 떠났습니다, 분리합니다.");
                  $("#remote" + remoteFeed.rfindex).empty().hide();
                  $("#videoremote" + remoteFeed.rfindex).empty();
                  feeds[remoteFeed.rfindex] = null;
                  remoteFeed.detach();
                }
              } else if (msg["error"]) {
                // 오류 처리
                if (msg["error_code"] === 426) {
                  bootbox.alert(
                      "<p>방 <code>" +
                      myroom +
                      "</code> (이 데모에서 사용하는 테스트 방)이 존재하지 않습니다...</p><p>업데이트된 <code>janus.plugin.videoroom.jcfg</code> 구성 파일이 있습니까? 만약 그렇지 않다면, 현재 구성 파일에서 방 <code>" +
                      myroom +
                      "</code>의 세부 정보를 복사한 후 Janus를 재시작하고 다시 시도하십시오."
                  );
                } else {
                  bootbox.alert(msg["error"]);
                }
              }
            }
          }
          if (jsep) {
            // SDP 처리
            Janus.debug("SDP 처리 중...", jsep);
            sfutest.handleRemoteJsep({ jsep: jsep });
            // 우리가 원했던 미디어가 거부된 경우 처리
            var audio = msg["audio_codec"];
            if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
              toastr.warning("우리의 오디오 스트림이 거부되었습니다, 시청자들은 우리 소리를 들을 수 없습니다.");
            }
            var video = msg["video_codec"];
            if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
              toastr.warning("우리의 비디오 스트림이 거부되었습니다, 시청자들은 우리를 볼 수 없습니다.");
              $("#myvideo").hide();
              $("#videolocal").append(
                  '<div class="no-video-container">' +
                  '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
                  '<span class="no-video-text" style="font-size: 16px;">비디오 거부됨, 웹캠 없음</span>' +
                  "</div>"
              );
            }
          }
        },
        onlocalstream: function (stream) {
          // 로컬 스트림 처리
          Janus.debug(" ::: 로컬 스트림 수신 :::", stream);
          mystream = stream;
          $("#videojoin").hide();  // 비디오 참가 요소 숨김
          $("#videos").removeClass("hide").show();  // 비디오 요소 표시
          if ($("#myvideo").length === 0) {
            // 비디오 요소 추가
            $("#videolocal").append(
                '<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>'
            );
            // 'mute' 버튼 추가
            $("#videolocal").append(
                '<button class="btn btn-warning btn-xs" id="mute" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;">Mute</button>'
            );
            $("#mute").click(toggleMute);  // 'mute' 버튼 클릭 이벤트 설정
            // 'unpublish' 버튼 추가
            $("#videolocal").append(
                '<button class="btn btn-warning btn-xs" id="unpublish" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;">Unpublish</button>'
            );
            $("#unpublish").click(unpublishOwnFeed);  // 'unpublish' 버튼 클릭 이벤트 설정
          }
          $("#publisher").removeClass("hide").html(myusername).show();  // 퍼블리셔 이름 표시
          Janus.attachMediaStream($("#myvideo").get(0), stream);  // 비디오 스트림 연결
          $("#myvideo").get(0).muted = "muted";  // 로컬 비디오 음소거
          if (
              sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
              sfutest.webrtcStuff.pc.iceConnectionState !== "connected"
          ) {
            // 비디오 요소의 부모 요소 차단
            $("#videolocal")
                .parent()
                .parent()
                .block({
                  message: "<b>퍼블리싱 중...</b>",
                  css: {
                    border: "none",
                    backgroundColor: "transparent",
                    color: "white",
                  },
                });
          }
          var videoTracks = stream.getVideoTracks();
          if (!videoTracks || videoTracks.length === 0) {
            // 웹캠 없음
            $("#myvideo").hide();
            if ($("#videolocal .no-video-container").length === 0) {
              $("#videolocal").append(
                  '<div class="no-video-container">' +
                  '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                  '<span class="no-video-text">웹캠을 사용할 수 없습니다.</span>' +
                  "</div>"
              );
            }
          } else {
            $("#videolocal .no-video-container").remove();  // 비디오 없음 컨테이너 제거
            $("#myvideo").removeClass("hide").show();  // 비디오 요소 표시
          }
        },
        onremotestream: function (stream) {
          // 퍼블리셔 스트림은 sendonly로 여기서는 기대하지 않음
        },
        oncleanup: function () {
          // 클린업 처리
          Janus.log(" ::: 클린업 알림 수신: 이제 비공개 상태입니다 :::");
          mystream = null;
          $("#videolocal").html('<button id="publish" class="btn btn-primary">퍼블리시</button>');  // 퍼블리시 버튼 추가
          $("#publish").click(function () {
            publishOwnFeed(true);
          });
          $("#videolocal").parent().parent().unblock();  // 부모 요소 차단 해제
          $("#bitrate").parent().parent().addClass("hide");  // 비트레이트 설정 UI 숨김
          $("#bitrate a").unbind("click");  // 비트레이트 클릭 이벤트 해제
        },
      });
    },
    error: function (error) {
      // Janus 오류 처리
      Janus.error(error);
      bootbox.alert("오류: " + error, function () {
        window.location.reload();
      });
    },
    destroyed: function () {
      // Janus 세션이 파괴된 경우 처리
      window.location.reload();
    },
  });
}

function VideoMeeting() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (loggedInUser) {
      setUsername(loggedInUser.username);
      initjanus();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (

      <div>
        {/*<nav className="navbar navbar-default navbar-static-top"></nav>*/}
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="page-header">
                <h1>
                  화상회의
                  {/*<button className="btn btn-default" autoComplete="off" id="start" onClick={initjanus}>*/}
                  {/*  Start*/}
                  {/*</button>*/}
                </h1>
              </div>
              <div className="container" id="details">
                <div className="row">
                  <div className="col-md-12">
                    <h3>Start 버튼을 누르고 데모를 시작하세요</h3>
                    <h4>채팅방 ID로 기존 채팅방을 연결하거나 새로 생성합니다.</h4>
                    <h4>* ID는 영문 또는 숫자로 입력해야 합니다.</h4>
                  </div>
                </div>
              </div>
              <div className="container hide" id="videojoin">
                <div className="row">
                  <div className="col-md-12" id="controls">
                    <div id="registernow">
                      <span className="label label-info" id="room"></span>
                      <div className="input-group margin-bottom-md" style={{ width: "100% !important" }}>
                        <span className="input-group-addon">방번호</span>
                        <input
                            autoComplete="off"
                            className="form-control"
                            type="text"
                            placeholder="방번호를 입력하세요"
                            id="roomname"
                        />
                      </div>
                      <span className="label label-info" id="you"></span>
                      <div className="input-group margin-bottom-md">
                        <span className="input-group-addon">대화명</span>
                        <input
                            autoComplete="off"
                            className="form-control"
                            type="text"
                            placeholder="내 대화명"
                            value={username}
                            id="username"
                            readOnly
                            onKeyPress={(e) => {
                              if (e.key === "Enter") checkEnter(e.target, e);
                            }}
                        />
                        <span className="input-group-btn">
                        <button className="btn btn-primary" autoComplete="off" id="register">
                          대화방 참여
                        </button>
                      </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="container hide" id="videos">
                <div className="row">
                  <div className="col-md-4">
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <h3 className="panel-title">
                          My Video <span className="label label-primary hide" id="publisher"></span>
                          <div className="btn-group btn-group-xs pull-right hide">
                            <div className="btn-group btn-group-xs">
                              <button
                                  id="bitrateset"
                                  autoComplete="off"
                                  className="btn btn-primary dropdown-toggle"
                                  data-toggle="dropdown"
                              >
                                Bandwidth<span className="caret"></span>
                              </button>
                              <ul id="bitrate" className="dropdown-menu" role="menu">
                                <li>
                                  <a href="#" id="0">
                                    No limit
                                  </a>
                                </li>
                                <li>
                                  <a href="#" id="128">
                                    Cap to 128kbit
                                  </a>
                                </li>
                                <li>
                                  <a href="#" id="256">
                                    Cap to 256kbit
                                  </a>
                                </li>
                                <li>
                                  <a href="#" id="512">
                                    Cap to 512kbit
                                  </a>
                                </li>
                                <li>
                                  <a href="#" id="1024">
                                    Cap to 1mbit
                                  </a>
                                </li>
                                <li>
                                  <a href="#" id="1500">
                                    Cap to 1.5mbit
                                  </a>
                                </li>
                                <li>
                                  <a href="#" id="2000">
                                    Cap to 2mbit
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </h3>
                      </div>
                      <div className="panel-body" id="videolocal"></div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <h3 className="panel-title">
                          Participants #1 <span className="label label-info hide" id="remote1"></span>
                        </h3>
                      </div>
                      <div className="panel-body relative" id="videoremote1"></div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <h3 className="panel-title">
                          Participants #2 <span className="label label-info hide" id="remote2"></span>
                        </h3>
                      </div>
                      <div className="panel-body relative" id="videoremote2"></div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <h3 className="panel-title">
                          Remote Video #3 <span className="label label-info hide" id="remote3"></span>
                        </h3>
                      </div>
                      <div className="panel-body relative" id="videoremote3"></div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <h3 className="panel-title">
                          Participants #4 <span className="label label-info hide" id="remote4"></span>
                        </h3>
                      </div>
                      <div className="panel-body relative" id="videoremote4"></div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <h3 className="panel-title">
                          Participants #5 <span className="label label-info hide" id="remote5"></span>
                        </h3>
                      </div>
                      <div className="panel-body relative" id="videoremote5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr />
        </div>
      </div>
  );
}

const checkEnter = (target, event) => {
  if (event.key === "Enter") {
    // Your enter key logic here
  }
};

export default VideoMeeting;
