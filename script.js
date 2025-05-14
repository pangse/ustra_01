function search() {
    const tbody = document.getElementById("result-body");
    tbody.innerHTML = `
      <tr>
        <td>1</td>
        <td>1001</td>
        <td>서울사업장</td>
        <td>PLN20240501</td>
        <td>2025-05-15</td>
        <td>SUP100</td>
        <td>ABC상사</td>
        <td>매입</td>
        <td>02-1234-5678</td>
        <td>02-8765-4321</td>
        <td>1200kg</td>
        <td>3.5m³</td>
        <td>YES</td>
        <td>대기</td>
        <td>-</td>
      </tr>`;
  }
  
  function reset() {
    document.getElementById("order-date-start").value = "";
    document.getElementById("order-date-end").value = "";
    document.getElementById("supplier").value = "";
    document.getElementById("plan-id").value = "";
    document.getElementById("remain").value = "YES";
    const tbody = document.getElementById("result-body");
    tbody.innerHTML = `<tr><td colspan="15" style="text-align:center;">조회된 데이터가 없습니다</td></tr>`;
  }
  
  function addRow() {
    const tbody = document.getElementById("result-body");
    tbody.innerHTML += `<tr><td colspan="15" style="text-align:center;">(신규 행 추가됨)</td></tr>`;
  }
  
  function save() {
    alert("저장 기능은 아직 구현되지 않았습니다.");
  }
  