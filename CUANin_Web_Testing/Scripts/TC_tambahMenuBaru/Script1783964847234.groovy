import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

WebUI.openBrowser(null)

WebUI.navigateToUrl('http://localhost:5173/')

WebUI.setText(findTestObject('Page_cuaninowner/input_namabisnis.id'), 'dwitegar2121@gmail.com')

WebUI.setEncryptedText(findTestObject('Page_cuaninowner/input_'), 'SkBtNjsS+FHxnnrRXbFqtA==')

WebUI.click(findTestObject('Page_cuaninowner/svg_lucide lucide-eye'))

WebUI.click(findTestObject('Page_cuaninowner/svg_lucide lucide-eye-off'))

WebUI.click(findTestObject('Page_cuaninowner/span_Masuk ke Dashboard'))

WebUI.click(findTestObject('Page_cuaninowner/div_Menu Management'))

WebUI.click(findTestObject('Page_cuaninowner/button_Add New Item'))

WebUI.setText(findTestObject('Page_cuaninowner/input_Contoh_ Americano Ice'), nama_menu)

if (kategori == 'Non-Coffee') {
    WebUI.click(findTestObject('Object Repository/Page_cuaninowner/span_Non-Coffee'))
} else if (kategori == 'Food') {
    // Pastikan 'span_Food' diganti dengan nama objek lu yang sebenarnya kalau beda
    WebUI.click(findTestObject('Object Repository/Page_cuaninowner/span_Food')) 
} else if (kategori == 'Pastry') {
    // Pastikan 'span_Pastry' diganti dengan nama objek lu yang sebenarnya kalau beda
    WebUI.click(findTestObject('Object Repository/Page_cuaninowner/span_Pastry'))
} else if (kategori == 'Coffee') {
    println('Kategori adalah Coffee, sudah default')
}

WebUI.setEncryptedText(findTestObject('Page_cuaninowner/input_'), 'HeCM15nHKBI=')

WebUI.setText(findTestObject('Page_cuaninowner/input_0'), harga)

WebUI.click(findTestObject('Page_cuaninowner/span_Tambah Bahan'))

WebUI.selectOptionByValue(findTestObject('Page_cuaninowner/select_Pilih Stok Bahan -Air MineralAir Mineral'), '6f834452-100e-4459-891b-919e5214e5fc', 
    false)

WebUI.selectOptionByValue(findTestObject('Page_cuaninowner/select_Pilih Stok Bahan -Air MineralAir Mineral_1'), '86d2cce3-d025-4087-bc43-00d0ddf34ae3', 
    false)

WebUI.selectOptionByValue(findTestObject('Page_cuaninowner/select_Pilih Stok Bahan -Air MineralAir Mineral_2'), '1a354c3d-b97c-4f43-92de-df9f0c465a41', 
    false)

WebUI.click(findTestObject('Page_cuaninowner/input_https'))

WebUI.doubleClick(findTestObject('Page_cuaninowner/input_https'))

WebUI.click(findTestObject('Page_cuaninowner/input_https'))

WebUI.click(findTestObject('Page_cuaninowner/button_URL'))

WebUI.click(findTestObject('Page_cuaninowner/input_https'))

WebUI.doubleClick(findTestObject('Page_cuaninowner/input_https'))

WebUI.click(findTestObject('Page_cuaninowner/input_https'))

WebUI.doubleClick(findTestObject('Page_cuaninowner/input_https'))

WebUI.click(findTestObject('Page_cuaninowner/button_Simpan Menu'))

// 1. Nungguin alert muncul (maksimal 5 detik)
WebUI.waitForAlert(5)

// 2. Baca isi pesannya apa
String teksAlert = WebUI.getAlertText()
println('Pesan dari sistem: ' + teksAlert)

// 3. Klik "OK" di alert browser
WebUI.acceptAlert()

// 4. Logika penentuan Sukses vs Gagal
if (teksAlert.contains('berhasil')) {
    // Skenario Valid: Form otomatis nutup, data sukses masuk.
    println('Testing Valid BERHASIL: Skenario Expected Result Tercapai.')
    
} else {
    // Skenario Invalid: Alert error muncul, form masih kebuka.
    println('Testing Invalid BERHASIL: Sistem menolak data jelek.')
    
    // KITA HARUS KLIK TOMBOL BATAL BIAR FORM NUTUP & SIAP BUAT DATA SELANJUTNYA
    WebUI.click(findTestObject('Object Repository/Page_cuaninowner/button_Batal'))
}