<?php

namespace App\Http\Controllers;
use Image;
use Illuminate\Http\Request;

class DataviewController extends Controller
{
	public static function getTmpPath(){
		return sys_get_temp_dir()."/";
	}

	public static function cropResult(Request $request){
		// dump($request->all());
		$imageData = $request->all()['imageData'];
		$cropBoxData = json_decode($request->all()['cropBoxData'], true);
		dump($imageData);
		dump($cropBoxData);
		dump(public_path('img/result.jpg'));

		// open an image file
		// $img = Image::make(asset('img/fachada8.jpg'));
		$img = Image::make($imageData->getPathname());
		// dump($img);

		// // now you are able to resize the instance
		// $img->resize(960, null, function ($constraint) {
		// 	$constraint->aspectRatio();
		// });
		// dump($img);

		// $img->crop((int)$cropBoxData['width'], (int)$cropBoxData['height'], (int)$cropBoxData['left'], (int)$cropBoxData['top']);
		// dump($img);

		// finally we save the image as a new file
		$img->save(public_path('img/result.jpg'));

		// $cropResult = imagecrop($im, ['x' => 0, 'y' => 0, 'width' => $size, 'height' => $size]);





		// return redirect()->route('crop-result', ['cropResult' => $cropResult]);
		// return back();

		// $inputs = Input::all();
		// // dump($inputs);
		// // dump($inputs['croppedImage']->getPathname());
		// echo "<img src'D:\Users\Thiago\Google_Drive\XAMPP\PROJETOS\intranetone_modulos\www\img\esic.png'></img>";
		// // dump($inputs['cropBoxData']);

		// // return response()->download('D:\Users\Thiago\Google_Drive\XAMPP\PROJETOS\intranetone_modulos\www\img\fachada8.JPG');
		
		// // return view('admin.slider.crop-result', ['img' => "<img src'{{ asset(img/fachada8.jpg) }}'></img>"]);
		// return redirect('admin/slider/crop-result');
	}

	public static function shortenImage(Request $request){
		// dump($request->all());

		$img = Image::make($request->all()['imageData']);
		$img->resize(960, null, function ($constraint) {
			$constraint->aspectRatio();
		});
		// $img->save(public_path('img/result.jpg'));

		return $data = (string) $img->encode('data-url');;

	}

}
