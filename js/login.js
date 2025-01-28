/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
$(document).ready(() => {
    if(localStorage.getItem("api")!= null && sessionStorage.getItem("isOnline") == null){
        let api = atob(localStorage.getItem("api"));
        $.ajax({
            url: api+":10800/api/ping",
            type: "GET",
            success: ()=>{
                $("#loginServer").val(api);
                sessionStorage.setItem("isOnline","true");
            }
        });
    }
    else if(cordova.platformId === 'browser')
        $("#loginServer").val(window.location.protocol+"//"+window.location.hostname);
    $('#loginForm').on('submit',(event)=> {
        event.preventDefault();
        var data = {
            email: $('#loginEmail').val(),
            password: $('#loginPassword').val()
        };
        $.ajax({
            url: $("#loginServer").val() + ':10800/api/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: (response) => {
                if(cordova.platformId === 'electron'){
                    localStorage.setItem('token',response.token);
                    localStorage.setItem('token-expires', new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toUTCString());
                }
                else
                    setCookie('token',response.token,7);
                localStorage.setItem("api", btoa($("#loginServer").val()));
                sessionStorage.removeItem("isOnline");
                localStorage.setItem("login", btoa($("#loginEmail").val()));
                window.location.href = '';
            },
            error: (error) => {
                console.log(error);
                $("#error-message").css("display","block");
                let reason = (error.statusText == "Unauthorized")?"Zły email lub hasło":"Serwer po tym adresem niedostępny (może zmień z https na http)"
                $("#error-message").html(reason)
            }
        });
    });
});
// function validationOfPassword(password){
//     const patern = /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;
//     return patern.test(password);
// }