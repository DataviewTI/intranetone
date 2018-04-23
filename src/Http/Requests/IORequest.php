<?php

namespace Dataview\IntranetOne;

use Illuminate\Foundation\Http\FormRequest;

class IORequest extends FormRequest
{
  public function authorize(){
    return true;
  }

  public function sanitize(){
    $input = $this->all();

    foreach($input as $key => $value)
      if(empty($value))
        $input[$key] = null;

      //$this->replace($input);
      return $input;
  }

  public function rules(){
    $this->sanitize();
  }

  public function messages(){
    return [];
  }
}
