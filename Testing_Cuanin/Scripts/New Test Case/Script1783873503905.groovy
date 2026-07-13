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

WebUI.setEncryptedText(findTestObject('Page_cuaninowner/input__1'), 'SkBtNjsS+FHxnnrRXbFqtA==')

WebUI.sendKeys(findTestObject('Page_cuaninowner/input__1'), Keys.chord(Keys.ENTER))

WebUI.click(findTestObject('Page_cuaninowner/span_Menu Management'))

WebUI.click(findTestObject('Page_cuaninowner/button_Add New Item'))

WebUI.setText(findTestObject('Page_cuaninowner/input_Contoh_ Americano Ice'), var_nama_baru)

WebUI.setEncryptedText(findTestObject('Page_cuaninowner/input_'), 'rLvs2r7lbdw=')

WebUI.click(findTestObject('Page_cuaninowner/span_Non-Coffee'))

WebUI.click(findTestObject('Page_cuaninowner/span_Tambah Bahan'))

WebUI.selectOptionByValue(findTestObject('Page_cuaninowner/select_Pilih Stok Bahan -Air MineralAir Mineral'), '83121e1d-3522-4570-b806-31127ed0938d', 
    false)

WebUI.selectOptionByValue(findTestObject('Page_cuaninowner/select_Pilih Stok Bahan -Air MineralAir Mineral_1'), '8e6cce60-f6ab-459f-924f-2b1e6c79a01f', 
    false)

WebUI.selectOptionByValue(findTestObject('Page_cuaninowner/select_Pilih Stok Bahan -Air MineralAir Mineral_2'), 'b31a8159-969a-4ec8-a869-182f3ff8e044', 
    false)

WebUI.click(findTestObject('Page_cuaninowner/input_https'))

WebUI.click(findTestObject('Page_cuaninowner/button_Upload'))

WebUI.click(findTestObject('Page_cuaninowner/button_Kamera'))

WebUI.click(findTestObject('Page_cuaninowner/button_Ambil Foto'))

WebUI.click(findTestObject('Page_cuaninowner/button_Simpan Menu'))

