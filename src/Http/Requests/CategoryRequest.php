<?php
namespace Dataview\IntranetOne;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class CategoryRequest extends FormRequest
{
  public function authorize() {
    return true;
  }

  public function sanitize(){
    $input = (object) $this->all();

    $clean = [];

    $clean['category'] = $input->cat_category;
    $clean['category_slug'] = Str::slug($input->cat_category, '-');
    $clean['erasable'] = $input->cat___erasable == "false" ? true : false;
    if(filled(optional($input)->cat___service_id)){
      $clean['service_id'] = Service::where('service',$input->cat___service_id)->value('id');
    }
    $clean['category_id'] = filled(optional($input)->cat_category_id) ? $input->cat_category_id : null;

    $clean['config'] =  filled(optional($input)->cat_config) ? json_decode($input->cat_config) : (object)[];

    $this->replace($clean);
	}

  public function rules()
  {
    $this->sanitize();
      return [
          // 'category' => 'required|max:255',
      ];
  }
}
