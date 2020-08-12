<?php

namespace App\Controller;

use App\Data\SearchData;
use App\From\SearchForm;
use App\Repository\ProductRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

class ProductController extends AbstractController
{
    /**
     * @Route("/", name="product")
     */
    public function index(Request $request, ProductRepository $repository)
    {
        $data = new SearchData();
        $data->page = $request->get('page', 1);

        $form = $this->createForm(SearchForm::class, $data);
        $form->handleRequest($request);

        [$min, $max] = $repository->findMinMax($data);

        $products = $repository->findSearch($data);

        if ($request->get('ajax')) {
            return new JsonResponse([
                'content' => $this->renderView('product/partials/_product.html.twig', ['products' => $products]),
                'sorting' => $this->renderView('product/partials/_sorting.html.twig', ['products' => $products]),
                'pagination' => $this->renderView('product/partials/_pagination.html.twig', ['products' => $products]),
                'min' => $min,
                'max' => $max
            ]);
        }

        return $this->render('product/index.html.twig', [
            'products' => $products,
            'form' => $form->createView(),
            'min' => $min,
            'max' => $max
        ]);
    }
}
