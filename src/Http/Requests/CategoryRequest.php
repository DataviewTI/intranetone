<?php
namespace Dataview\IntranetOne;
//namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    public function sanitize(){
        $input = $this->all();
        
        if (!array_key_exists("erasable", $input))
            $input['erasable'] = 1;
        
        $input['category_slug'] = str_slug($input['category'], '-');

        if(!array_key_exists('category_id',$input)){
		    $input['category_id'] = null;
        }

		$this->replace($input);
	}

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
   		$this->sanitize();
        return [
            'category' => 'required|max:255',
        ];
    }
}
